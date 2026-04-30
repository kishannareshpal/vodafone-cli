import { describe, expect, it } from "@effect/vitest"

import { getCliHelpText } from "../src/CliHelp.js"

describe("CliHelp", () => {
  it("renders compact root help for no arguments", () => {
    expect(getCliHelpText([])).toBe(`Vodafone CLI 0.0.0

Usage:
  vodafone-cli <command>

Commands:
  config get router-url         Read the configured router URL
  config set router-url <url>   Set the router admin URL
  devices list [--json]         List currently connected devices
  login [--password-stdin]      Verify and save router admin auth

Options:
  -h, --help                    Show help
  --version                     Show version`)
  })

  it("renders compact config help", () => {
    expect(getCliHelpText(["config", "--help"])).toBe(`Vodafone CLI 0.0.0

Usage:
  vodafone-cli config get router-url
  vodafone-cli config set router-url <url>

Manage non-secret Vodafone CLI configuration.

Commands:
  get router-url                Read the configured router URL
  set router-url <url>          Set the router admin URL

Options:
  -h, --help                    Show help`)
  })

  it("renders compact devices help", () => {
    expect(getCliHelpText(["devices", "--help"])).toBe(`Vodafone CLI 0.0.0

Usage:
  vodafone-cli devices list [--json] [--refresh-session]

Read router connected-device information.

Commands:
  list [--json]                 List currently connected devices

Options:
  -h, --help                    Show help`)
  })

  it("renders compact devices list help", () => {
    expect(getCliHelpText(["devices", "list", "--help"])).toBe(`Vodafone CLI 0.0.0

Usage:
  vodafone-cli devices list [--json] [--refresh-session]

List currently connected devices.

Options:
  --json                        Print connected devices as JSON
  --refresh-session             Refresh the saved router session before reading devices
  -h, --help                    Show help`)
  })

  it("renders compact login help", () => {
    expect(getCliHelpText(["login", "--help"])).toBe(`Vodafone CLI 0.0.0

Usage:
  vodafone-cli login [--password-stdin]

Verify and save the router admin credential and session.

Options:
  --password-stdin              Read router admin password from stdin
  -h, --help                    Show help`)
  })

  it("renders compact nested command help", () => {
    expect(getCliHelpText(["config", "get", "--help"])).toBe(`Vodafone CLI 0.0.0

Usage:
  vodafone-cli config get router-url

Read the configured router URL.

Options:
  -h, --help                    Show help`)

    expect(getCliHelpText(["config", "set", "--help"])).toBe(`Vodafone CLI 0.0.0

Usage:
  vodafone-cli config set router-url <url>

Set the router admin URL.

Options:
  -h, --help                    Show help`)
  })

  it("ignores normal command execution arguments", () => {
    expect(getCliHelpText(["login"])).toBeNull()
    expect(getCliHelpText(["config", "get", "router-url"])).toBeNull()
    expect(getCliHelpText(["devices", "list"])).toBeNull()
  })
})
