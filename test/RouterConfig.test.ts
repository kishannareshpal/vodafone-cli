import { afterEach, describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import * as path from "node:path"

import { defaultRouterUrl, readRouterConfig, writeRouterConfig } from "../src/config/RouterConfig.js"

const previousXdgConfigHome = process.env.XDG_CONFIG_HOME
const previousAppData = process.env.APPDATA

afterEach(() => {
  if (previousXdgConfigHome === undefined) {
    delete process.env.XDG_CONFIG_HOME
  } else {
    process.env.XDG_CONFIG_HOME = previousXdgConfigHome
  }

  if (previousAppData === undefined) {
    delete process.env.APPDATA
  } else {
    process.env.APPDATA = previousAppData
  }
})

const withTempConfigHome = async <A>(f: (configHome: string) => Promise<A>) => {
  const configHome = await mkdtemp(path.join(tmpdir(), "vodafone-cli-test-"))

  try {
    process.env.XDG_CONFIG_HOME = configHome
    delete process.env.APPDATA
    return await f(configHome)
  } finally {
    await rm(configHome, { force: true, recursive: true })
  }
}

describe("RouterConfig", () => {
  it("returns the default router URL when no config file exists", async () => {
    await withTempConfigHome(async () => {
      const config = await Effect.runPromise(readRouterConfig)

      expect(config.routerUrl).toBe(defaultRouterUrl)
    })
  })

  it("writes and reads a normalized router URL", async () => {
    await withTempConfigHome(async (configHome) => {
      const written = await Effect.runPromise(writeRouterConfig({ routerUrl: "http://192.168.1.254/" }))
      const read = await Effect.runPromise(readRouterConfig)
      const file = await readFile(path.join(configHome, "vodafone-cli", "config.json"), "utf8")

      expect(written.routerUrl).toBe("http://192.168.1.254")
      expect(read.routerUrl).toBe("http://192.168.1.254")
      expect(JSON.parse(file)).toEqual({ routerUrl: "http://192.168.1.254" })
    })
  })
})
