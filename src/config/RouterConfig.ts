import { mkdir, readFile, writeFile } from "node:fs/promises"
import { homedir } from "node:os"
import * as path from "node:path"

import * as Effect from "effect/Effect"

export const defaultRouterUrl = "http://192.168.1.1"

export interface RouterConfig {
  readonly routerUrl: string
}

export class InvalidRouterUrl extends Error {
  readonly _tag = "InvalidRouterUrl"

  constructor(readonly value: string) {
    super(`Router URL must be an absolute http(s) base URL: ${value}`)
  }
}

export class ConfigReadError extends Error {
  readonly _tag = "ConfigReadError"

  constructor(readonly cause: unknown) {
    super("Could not read router configuration")
  }
}

export class ConfigWriteError extends Error {
  readonly _tag = "ConfigWriteError"

  constructor(readonly cause: unknown) {
    super("Could not write router configuration")
  }
}

const configDirectory = () => {
  if (process.platform === "win32") {
    return path.join(process.env.APPDATA ?? path.join(homedir(), "AppData", "Roaming"), "vodafone-cli")
  }

  return path.join(process.env.XDG_CONFIG_HOME ?? path.join(homedir(), ".config"), "vodafone-cli")
}

export const configFilePath = () => path.join(configDirectory(), "config.json")

const normalizeRouterUrl = (value: string) => {
  try {
    const url = new URL(value)
    const hasBasePath = url.pathname !== "" && url.pathname !== "/"

    if (!["http:", "https:"].includes(url.protocol) || hasBasePath || url.search !== "" || url.hash !== "") {
      throw new InvalidRouterUrl(value)
    }

    return url.origin
  } catch (error) {
    if (error instanceof InvalidRouterUrl) {
      throw error
    }

    throw new InvalidRouterUrl(value)
  }
}

const parseConfig = (contents: string): RouterConfig => {
  const config = JSON.parse(contents) as Partial<RouterConfig>
  return {
    routerUrl: typeof config.routerUrl === "string" ? normalizeRouterUrl(config.routerUrl) : defaultRouterUrl
  }
}

export const readRouterConfig = Effect.tryPromise({
  try: async () => {
    try {
      return parseConfig(await readFile(configFilePath(), "utf8"))
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
        return { routerUrl: defaultRouterUrl }
      }

      throw error
    }
  },
  catch: (error) => new ConfigReadError(error)
})

export const writeRouterConfig = (config: RouterConfig) =>
  Effect.tryPromise({
    try: async () => {
      const normalizedConfig = {
        routerUrl: normalizeRouterUrl(config.routerUrl)
      }

      await mkdir(configDirectory(), { recursive: true })
      await writeFile(configFilePath(), `${JSON.stringify(normalizedConfig, null, 2)}\n`, "utf8")
      return normalizedConfig
    },
    catch: (error) => new ConfigWriteError(error)
  })
