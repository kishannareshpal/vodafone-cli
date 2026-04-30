import * as Command from "@effect/cli/Command"
import type { NodeContext } from "@effect/platform-node/NodeContext"
import type { Effect } from "effect/Effect"

import { cliName, cliVersion } from "./CliMetadata.js"
import { config } from "./commands/config.js"
import { devices } from "./commands/devices.js"
import { login } from "./commands/login.js"

const command = Command.make("vodafone-cli").pipe(
  Command.withSubcommands([config, devices, login])
)

export const run: (args: ReadonlyArray<string>) => Effect<void, unknown, NodeContext> = Command.run(command, {
  name: cliName,
  version: cliVersion
})
