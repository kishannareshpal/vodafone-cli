import { describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"

import type { RouterCredentialEntry } from "../src/credentials/RouterCredentials.js"
import {
  credentialAccount,
  credentialService,
  deleteRouterCredential,
  getRouterAuthRecord,
  parseRouterAuthRecord,
  setRouterAuthRecord
} from "../src/credentials/RouterCredentials.js"

const makeEntry = (initialCredential: string | null = null) => {
  let credential = initialCredential

  const entry: RouterCredentialEntry = {
    getPassword: async () => credential,
    setPassword: async (password) => {
      credential = password
    },
    deleteCredential: async () => {
      const deleted = credential !== null
      credential = null
      return deleted
    }
  }

  return entry
}

describe("RouterCredentials", () => {
  it("uses the agreed keychain service and account names", () => {
    expect(credentialService).toBe("vodafone-cli")
    expect(credentialAccount).toBe("router-admin")
  })

  it("sets and reads a router auth record", async () => {
    const entry = makeEntry()
    const entryFactory = () => entry
    const record = {
      credential: "secret",
      sessionCookie: "sessionID=abc123",
      sessionSavedAt: "2026-04-30T12:00:00.000Z"
    }

    await Effect.runPromise(setRouterAuthRecord(record, entryFactory))
    const credential = await Effect.runPromise(getRouterAuthRecord(entryFactory))

    expect(credential).toStrictEqual(record)
  })

  it("returns null when no router auth record is stored", async () => {
    const credential = await Effect.runPromise(getRouterAuthRecord(() => makeEntry()))

    expect(credential).toBeNull()
  })

  it("returns null for legacy raw credential values", () => {
    expect(parseRouterAuthRecord("secret")).toBeNull()
  })

  it("deletes a router credential", async () => {
    const entry = makeEntry(JSON.stringify({
      credential: "secret",
      sessionCookie: "sessionID=abc123",
      sessionSavedAt: "2026-04-30T12:00:00.000Z"
    }))
    const entryFactory = () => entry

    await expect(Effect.runPromise(deleteRouterCredential(entryFactory))).resolves.toBe(true)
    await expect(Effect.runPromise(getRouterAuthRecord(entryFactory))).resolves.toBeNull()
  })
})
