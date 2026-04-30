#!/usr/bin/env node

import * as NodeContext from "@effect/platform-node/NodeContext"
import * as NodeRuntime from "@effect/platform-node/NodeRuntime"
import * as Effect from "effect/Effect"
import { run } from "./Cli.js"
import { getCliHelpText } from "./CliHelp.js"

const helpText = getCliHelpText(process.argv.slice(2))

if (helpText === null) {
  run(process.argv).pipe(
    Effect.provide(NodeContext.layer),
    NodeRuntime.runMain({ disableErrorReporting: true })
  )
} else {
  console.log(helpText)
}
