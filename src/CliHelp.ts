import { cliExecutable, cliName, cliVersion } from "./CliMetadata.js"

const helpFlags = new Set(["-h", "--help"])

const rootHelp = `${cliName} ${cliVersion}

Usage:
  ${cliExecutable} <command>

Commands:
  config get router-url         Read the configured router URL
  config set router-url <url>   Set the router admin URL
  devices list [--json]         List currently connected devices
  login [--password-stdin]      Verify and save router admin auth

Options:
  -h, --help                    Show help
  --version                     Show version`

const configHelp = `${cliName} ${cliVersion}

Usage:
  ${cliExecutable} config get router-url
  ${cliExecutable} config set router-url <url>

Manage non-secret Vodafone CLI configuration.

Commands:
  get router-url                Read the configured router URL
  set router-url <url>          Set the router admin URL

Options:
  -h, --help                    Show help`

const configGetHelp = `${cliName} ${cliVersion}

Usage:
  ${cliExecutable} config get router-url

Read the configured router URL.

Options:
  -h, --help                    Show help`

const configSetHelp = `${cliName} ${cliVersion}

Usage:
  ${cliExecutable} config set router-url <url>

Set the router admin URL.

Options:
  -h, --help                    Show help`

const loginHelp = `${cliName} ${cliVersion}

Usage:
  ${cliExecutable} login [--password-stdin]

Verify and save the router admin credential and session.

Options:
  --password-stdin              Read router admin password from stdin
  -h, --help                    Show help`

const devicesHelp = `${cliName} ${cliVersion}

Usage:
  ${cliExecutable} devices list [--json] [--refresh-session]

Read router connected-device information.

Commands:
  list [--json]                 List currently connected devices

Options:
  -h, --help                    Show help`

const devicesListHelp = `${cliName} ${cliVersion}

Usage:
  ${cliExecutable} devices list [--json] [--refresh-session]

List currently connected devices.

Options:
  --json                        Print connected devices as JSON
  --refresh-session             Refresh the saved router session before reading devices
  -h, --help                    Show help`

const stripHelpFlags = (args: ReadonlyArray<string>) => args.filter((arg) => !helpFlags.has(arg))

const isHelpRequest = (args: ReadonlyArray<string>) => args.some((arg) => helpFlags.has(arg))

export const getCliHelpText = (args: ReadonlyArray<string>): string | null => {
  if (args.length === 0) {
    return rootHelp
  }

  if (!isHelpRequest(args)) {
    return null
  }

  const commandPath = stripHelpFlags(args)

  if (commandPath.length === 0) {
    return rootHelp
  }

  switch (commandPath[0]) {
    case "config": {
      switch (commandPath[1]) {
        case "get":
          return configGetHelp
        case "set":
          return configSetHelp
        default:
          return configHelp
      }
    }
    case "login":
      return loginHelp
    case "devices": {
      switch (commandPath[1]) {
        case "list":
          return devicesListHelp
        default:
          return devicesHelp
      }
    }
    default:
      return null
  }
}
