import { describe, expect, it } from "@effect/vitest"

import { formatConnectedDevicesTable } from "../src/commands/devices.js"

describe("devices command output", () => {
  it("formats connected devices as a compact table", () => {
    expect(formatConnectedDevicesTable([
      {
        name: "Laptop",
        ipAddress: "192.168.1.20",
        ipv4Address: "192.168.1.20",
        ipv6Addresses: [],
        macAddress: "aa:bb:cc:dd:ee:ff",
        connection: "Wi-Fi 5GHz",
        ssid: "Home",
        signal: 4,
        speedMbps: 866.667,
        manufacturer: null,
        model: null
      },
      {
        name: "NAS",
        ipAddress: "192.168.1.30",
        ipv4Address: "192.168.1.30",
        ipv6Addresses: [],
        macAddress: "11:22:33:44:55:66",
        connection: "Ethernet",
        ssid: null,
        signal: null,
        speedMbps: 1000,
        manufacturer: null,
        model: null
      }
    ])).toBe(`Name    IP            MAC                Connection  SSID  Signal
------  ------------  -----------------  ----------  ----  ------
Laptop  192.168.1.20  aa:bb:cc:dd:ee:ff  Wi-Fi 5GHz  Home  4/4
NAS     192.168.1.30  11:22:33:44:55:66  Ethernet    -     -`)
  })

  it("formats an empty result", () => {
    expect(formatConnectedDevicesTable([])).toBe("No connected devices found.")
  })
})
