import * as Command from "@effect/cli/Command"
import * as Options from "@effect/cli/Options"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"

import { cliExecutable } from "../CliMetadata.js"
import { readRouterConfig } from "../config/RouterConfig.js"
import { getRouterAuthRecord, type RouterAuthRecord, setRouterAuthRecord } from "../credentials/RouterCredentials.js"
import { authenticateRouter } from "../router/RouterAuth.js"
import { type ConnectedDevice, readConnectedDevices } from "../router/RouterDevices.js"

class MissingRouterAuthRecord extends Error {
  readonly _tag = "MissingRouterAuthRecord"

  constructor() {
    super(`No router credential found. Run "${cliExecutable} login" first.`)
  }
}

const jsonOutput = Options.boolean("json").pipe(
  Options.withDescription("Print connected devices as JSON.")
)

const refreshSession = Options.boolean("refresh-session").pipe(
  Options.withDescription("Refresh the saved router session before reading devices.")
)

const displayValue = (value: string | number | null) => {
  if (value === null || value === "") {
    return "-"
  }

  return String(value)
}

const tableRows = (devices: ReadonlyArray<ConnectedDevice>) =>
  devices.map((device) => [
    displayValue(device.name),
    displayValue(device.ipAddress),
    displayValue(device.macAddress),
    device.connection,
    displayValue(device.ssid),
    device.signal === null ? "-" : `${device.signal}/4`
  ])

export const formatConnectedDevicesTable = (devices: ReadonlyArray<ConnectedDevice>) => {
  if (devices.length === 0) {
    return "No connected devices found."
  }

  const headers = ["Name", "IP", "MAC", "Connection", "SSID", "Signal"]
  const rows = tableRows(devices)
  const widths = headers.map((header, index) => Math.max(header.length, ...rows.map((row) => row[index]?.length ?? 0)))
  const formatRow = (row: ReadonlyArray<string>) =>
    row.map((value, index) => value.padEnd(widths[index] ?? value.length)).join("  ").trimEnd()

  return [formatRow(headers), formatRow(widths.map((width) => "-".repeat(width))), ...rows.map(formatRow)].join("\n")
}

const makeAuthRecord = (credential: string, sessionCookie: string): RouterAuthRecord => ({
  credential,
  sessionCookie,
  sessionSavedAt: new Date().toISOString()
})

const refreshRouterSession = (routerUrl: string, record: RouterAuthRecord) =>
  Effect.gen(function*() {
    const session = yield* authenticateRouter(routerUrl, record.credential)
    const refreshedRecord = makeAuthRecord(record.credential, session.cookieHeader)
    yield* setRouterAuthRecord(refreshedRecord)
    return refreshedRecord
  })

const readDevicesWithSessionRefresh = (
  routerUrl: string,
  record: RouterAuthRecord,
  shouldRefreshSession: boolean
) =>
  Effect.gen(function*() {
    if (shouldRefreshSession) {
      const refreshedRecord = yield* refreshRouterSession(routerUrl, record)
      return yield* readConnectedDevices(routerUrl, { cookieHeader: refreshedRecord.sessionCookie })
    }

    return yield* readConnectedDevices(routerUrl, { cookieHeader: record.sessionCookie }).pipe(
      Effect.catchTag("RouterSessionExpired", () =>
        Effect.gen(function*() {
          const refreshedRecord = yield* refreshRouterSession(routerUrl, record)
          return yield* readConnectedDevices(routerUrl, { cookieHeader: refreshedRecord.sessionCookie })
        }))
    )
  })

const reportDevicesError = (error: Error) =>
  Console.error(error.message).pipe(
    Effect.zipRight(Effect.sync(() => {
      process.exitCode = 1
    }))
  )

const list = Command.make(
  "list",
  { jsonOutput, refreshSession },
  ({ jsonOutput, refreshSession }) =>
    Effect.gen(function*() {
      const config = yield* readRouterConfig
      const authRecord = yield* getRouterAuthRecord()

      if (authRecord === null) {
        return yield* Effect.fail(new MissingRouterAuthRecord())
      }

      const result = yield* readDevicesWithSessionRefresh(config.routerUrl, authRecord, refreshSession)
      const output = jsonOutput ? JSON.stringify(result.devices, null, 2) : formatConnectedDevicesTable(result.devices)

      yield* Console.log(output)
    }).pipe(
      Effect.catchTags({
        ConfigReadError: reportDevicesError,
        CredentialReadError: reportDevicesError,
        CredentialWriteError: reportDevicesError,
        MissingRouterAuthRecord: reportDevicesError,
        RouterAuthError: reportDevicesError,
        RouterDevicesError: reportDevicesError,
        RouterSessionExpired: reportDevicesError
      })
    )
).pipe(Command.withDescription("List currently connected devices."))

export const devices = Command.make("devices").pipe(
  Command.withDescription("Read router connected-device information."),
  Command.withSubcommands([list])
)
