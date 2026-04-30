import * as Effect from "effect/Effect"

import { CookieJar, fetchWithCookies, joinRouterUrl, type RouterSession } from "./RouterHttp.js"

export type DeviceConnection =
  | "Ethernet"
  | "Wi-Fi 2.4GHz"
  | "Wi-Fi 5GHz"
  | "Guest Wi-Fi 2.4GHz"
  | "Guest Wi-Fi 5GHz"

export interface ConnectedDevice {
  readonly name: string | null
  readonly ipAddress: string | null
  readonly ipv4Address: string | null
  readonly ipv6Addresses: ReadonlyArray<string>
  readonly macAddress: string | null
  readonly connection: DeviceConnection
  readonly ssid: string | null
  readonly signal: number | null
  readonly speedMbps: number | null
  readonly manufacturer: string | null
  readonly model: string | null
}

export interface ConnectedDeviceResult {
  readonly devices: ReadonlyArray<ConnectedDevice>
  readonly session: RouterSession
}

export class RouterDevicesError extends Error {
  readonly _tag = "RouterDevicesError"

  constructor(message: string, readonly cause?: unknown) {
    super(message)
  }
}

export class RouterSessionExpired extends Error {
  readonly _tag = "RouterSessionExpired"

  constructor() {
    super("Router session expired")
  }
}

interface RouterDeviceRow {
  readonly Class?: unknown
  readonly FriendlyName?: unknown
  readonly HostName?: unknown
  readonly IPAddress?: unknown
  readonly IPv4?: unknown
  readonly IPv6?: unknown
  readonly MACAddress?: unknown
  readonly Manufacturer?: unknown
  readonly Model?: unknown
  readonly SSID?: unknown
  readonly Speed?: unknown
  readonly State?: unknown
  readonly radioSignalIcon?: unknown
}

interface WifiInfoResponse {
  readonly wifiList24?: ReadonlyArray<RouterDeviceRow>
  readonly wifiList5?: ReadonlyArray<RouterDeviceRow>
  readonly guestWifi24?: ReadonlyArray<RouterDeviceRow>
  readonly guestWifi5?: ReadonlyArray<RouterDeviceRow>
}

interface NetworkInfoResponse {
  readonly ethList?: ReadonlyArray<RouterDeviceRow>
}

interface DeviceSource {
  readonly connection: DeviceConnection
  readonly rows: ReadonlyArray<RouterDeviceRow> | undefined
}

const wifiPath = "/modals/overview.lp?status=wifiInfo&auto_update=true"
const networkPath = "/modals/overview.lp?status=networkInfo&auto_update=true"

const stringValue = (value: unknown) => typeof value === "string" ? value.trim() : ""

const nullableString = (value: unknown) => {
  const text = stringValue(value)
  return text === "" ? null : text
}

const parseNumber = (value: unknown) => {
  const text = stringValue(value)
  const number = Number(text)
  return Number.isFinite(number) ? number : null
}

const splitIpAddresses = (value: unknown) => stringValue(value).split(/\s+/).filter((part) => part !== "")

const isIpv4Address = (value: string) => /^\d{1,3}(?:\.\d{1,3}){3}$/.test(value)

const normalizeMacAddress = (value: unknown) => {
  const text = stringValue(value).toLowerCase()
  return text === "" ? null : text
}

const bestDeviceName = (row: RouterDeviceRow) =>
  nullableString(row.FriendlyName) ?? nullableString(row.HostName) ?? normalizeMacAddress(row.MACAddress)

const addressesForRow = (row: RouterDeviceRow) => {
  const addresses = splitIpAddresses(row.IPAddress)
  const ipv4FromField = nullableString(row.IPv4)
  const ipv6FromField = splitIpAddresses(row.IPv6)

  if (ipv4FromField !== null && !addresses.includes(ipv4FromField)) {
    addresses.unshift(ipv4FromField)
  }

  for (const ipv6Address of ipv6FromField) {
    if (!addresses.includes(ipv6Address)) {
      addresses.push(ipv6Address)
    }
  }

  return addresses
}

const normalizeDevice = (source: DeviceSource, row: RouterDeviceRow): ConnectedDevice | null => {
  if (stringValue(row.State) !== "1") {
    return null
  }

  const addresses = addressesForRow(row)
  const ipv4Address = addresses.find(isIpv4Address) ?? null
  const ipv6Addresses = addresses.filter((address) => !isIpv4Address(address))

  return {
    name: bestDeviceName(row),
    ipAddress: ipv4Address ?? ipv6Addresses[0] ?? null,
    ipv4Address,
    ipv6Addresses,
    macAddress: normalizeMacAddress(row.MACAddress),
    connection: source.connection,
    ssid: source.connection === "Ethernet" ? null : nullableString(row.SSID),
    signal: source.connection === "Ethernet" ? null : parseNumber(row.radioSignalIcon),
    speedMbps: parseNumber(row.Speed),
    manufacturer: nullableString(row.Manufacturer),
    model: nullableString(row.Model)
  }
}

const isEthernet = (device: ConnectedDevice) => device.connection === "Ethernet"

const isPreferredDuplicate = (candidate: ConnectedDevice, current: ConnectedDevice) => {
  if (isEthernet(candidate) !== isEthernet(current)) {
    return isEthernet(candidate)
  }

  return (candidate.signal ?? -1) > (current.signal ?? -1)
}

export const normalizeConnectedDevices = (
  wifiInfo: WifiInfoResponse,
  networkInfo: NetworkInfoResponse
): ReadonlyArray<ConnectedDevice> => {
  const sources: ReadonlyArray<DeviceSource> = [
    { connection: "Wi-Fi 2.4GHz", rows: wifiInfo.wifiList24 },
    { connection: "Wi-Fi 5GHz", rows: wifiInfo.wifiList5 },
    { connection: "Guest Wi-Fi 2.4GHz", rows: wifiInfo.guestWifi24 },
    { connection: "Guest Wi-Fi 5GHz", rows: wifiInfo.guestWifi5 },
    { connection: "Ethernet", rows: networkInfo.ethList }
  ]
  const devicesWithoutMac: Array<ConnectedDevice> = []
  const devicesByMac = new Map<string, ConnectedDevice>()

  for (const source of sources) {
    for (const row of source.rows ?? []) {
      const device = normalizeDevice(source, row)

      if (device === null) {
        continue
      }

      if (device.macAddress === null) {
        devicesWithoutMac.push(device)
        continue
      }

      const currentDevice = devicesByMac.get(device.macAddress)
      if (currentDevice === undefined || isPreferredDuplicate(device, currentDevice)) {
        devicesByMac.set(device.macAddress, device)
      }
    }
  }

  return [...devicesByMac.values(), ...devicesWithoutMac].sort((left, right) =>
    (left.name ?? "").localeCompare(right.name ?? "")
  )
}

const isLoginHtml = (text: string) =>
  text.includes("login-txt-pwd") || text.includes("srp.identify") || text.includes("Session Expired")

const readRouterJson = async <A>(routerUrl: string, path: string, label: string, cookies: CookieJar): Promise<A> => {
  const response = await fetchWithCookies(joinRouterUrl(routerUrl, path), { method: "GET" }, cookies)

  if (response.status === 401 || response.status === 403) {
    throw new RouterSessionExpired()
  }

  if (!response.ok) {
    throw new RouterDevicesError(`Could not read ${label} devices`)
  }

  const text = await response.text()
  if (isLoginHtml(text)) {
    throw new RouterSessionExpired()
  }

  try {
    return JSON.parse(text) as A
  } catch (error) {
    throw new RouterDevicesError(`Could not parse ${label} devices`, error)
  }
}

const readConnectedDevicesPromise = async (
  routerUrl: string,
  session: RouterSession
): Promise<ConnectedDeviceResult> => {
  const cookies = new CookieJar(session)
  const wifiInfo = await readRouterJson<WifiInfoResponse>(routerUrl, wifiPath, "Wi-Fi", cookies)
  const networkInfo = await readRouterJson<NetworkInfoResponse>(routerUrl, networkPath, "Ethernet", cookies)

  return {
    devices: normalizeConnectedDevices(wifiInfo, networkInfo),
    session: cookies.session
  }
}

export const readConnectedDevices = (routerUrl: string, session: RouterSession) =>
  Effect.tryPromise({
    try: () => readConnectedDevicesPromise(routerUrl, session),
    catch: (error) =>
      error instanceof RouterDevicesError || error instanceof RouterSessionExpired
        ? error
        : new RouterDevicesError("Could not read connected devices", error)
  })
