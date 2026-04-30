import { describe, expect, it } from "@effect/vitest"

import { normalizeConnectedDevices } from "../src/router/RouterDevices.js"

describe("RouterDevices", () => {
  it("normalizes only connected Wi-Fi and Ethernet devices", () => {
    const devices = normalizeConnectedDevices(
      {
        wifiList24: [
          {
            FriendlyName: "Kitchen Light",
            IPAddress: "192.168.1.20",
            IPv4: "192.168.1.20",
            IPv6: "",
            MACAddress: "AA:BB:CC:DD:EE:01",
            Manufacturer: "Acme",
            Model: "Bulb",
            SSID: "Home",
            Speed: "72.222",
            State: "1",
            radioSignalIcon: "3"
          },
          {
            FriendlyName: "Offline Phone",
            IPAddress: "192.168.1.21",
            MACAddress: "AA:BB:CC:DD:EE:02",
            State: "0"
          }
        ],
        wifiList5: [],
        guestWifi24: [],
        guestWifi5: []
      },
      {
        ethList: [
          {
            FriendlyName: "NAS",
            IPAddress: "192.168.1.30 2a0a:ef40::1",
            IPv4: "192.168.1.30",
            IPv6: "2a0a:ef40::1",
            MACAddress: "AA:BB:CC:DD:EE:03",
            Speed: "1000",
            State: "1"
          }
        ]
      }
    )

    expect(devices).toStrictEqual([
      {
        name: "Kitchen Light",
        ipAddress: "192.168.1.20",
        ipv4Address: "192.168.1.20",
        ipv6Addresses: [],
        macAddress: "aa:bb:cc:dd:ee:01",
        connection: "Wi-Fi 2.4GHz",
        ssid: "Home",
        signal: 3,
        speedMbps: 72.222,
        manufacturer: "Acme",
        model: "Bulb"
      },
      {
        name: "NAS",
        ipAddress: "192.168.1.30",
        ipv4Address: "192.168.1.30",
        ipv6Addresses: ["2a0a:ef40::1"],
        macAddress: "aa:bb:cc:dd:ee:03",
        connection: "Ethernet",
        ssid: null,
        signal: null,
        speedMbps: 1000,
        manufacturer: null,
        model: null
      }
    ])
  })

  it("deduplicates by MAC and prefers Ethernet over Wi-Fi", () => {
    const devices = normalizeConnectedDevices(
      {
        wifiList24: [
          {
            FriendlyName: "Dock",
            IPAddress: "192.168.1.40",
            MACAddress: "AA:BB:CC:DD:EE:04",
            SSID: "Home",
            State: "1",
            radioSignalIcon: "4"
          }
        ]
      },
      {
        ethList: [
          {
            FriendlyName: "Dock",
            IPAddress: "192.168.1.41",
            MACAddress: "aa:bb:cc:dd:ee:04",
            State: "1"
          }
        ]
      }
    )

    expect(devices).toHaveLength(1)
    expect(devices[0]?.connection).toBe("Ethernet")
    expect(devices[0]?.ipAddress).toBe("192.168.1.41")
  })
})
