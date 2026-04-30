import * as Args from "@effect/cli/Args"
import * as Command from "@effect/cli/Command"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"

import type { ConfigReadError, ConfigWriteError } from "../config/RouterConfig.js"
import { readRouterConfig, writeRouterConfig } from "../config/RouterConfig.js"

const routerUrlKey = Args.choice([["router-url", "router-url"]], { name: "key" }).pipe(
  Args.withDescription("The configuration key to read or write.")
)

const routerUrlValue = Args.text({ name: "url" }).pipe(
  Args.withDescription("The router admin base URL.")
)

const reportConfigError = (error: ConfigReadError | ConfigWriteError) =>
  Console.error(error.cause instanceof Error ? error.cause.message : error.message).pipe(
    Effect.zipRight(Effect.sync(() => {
      process.exitCode = 1
    }))
  )

const get = Command.make("get", { key: routerUrlKey }, ({ key }) =>
  Effect.gen(function*() {
    const config = yield* readRouterConfig

    switch (key) {
      case "router-url": {
        yield* Console.log(config.routerUrl)
        return
      }
    }
  }).pipe(Effect.catchTag("ConfigReadError", reportConfigError))).pipe(
    Command.withDescription("Read a saved configuration value.")
  )

const set = Command.make(
  "set",
  { key: routerUrlKey, value: routerUrlValue },
  ({ key, value }) =>
    Effect.gen(function*() {
      switch (key) {
        case "router-url": {
          const config = yield* writeRouterConfig({ routerUrl: value })
          yield* Console.log(`router-url=${config.routerUrl}`)
          return
        }
      }
    }).pipe(Effect.catchTag("ConfigWriteError", reportConfigError))
).pipe(Command.withDescription("Write a saved configuration value."))

export const config = Command.make("config").pipe(
  Command.withDescription("Manage non-secret Vodafone CLI configuration."),
  Command.withSubcommands([get, set])
)
