import { AsyncEntry } from "@napi-rs/keyring"
import * as Effect from "effect/Effect"

export const credentialService = "vodafone-cli"
export const credentialAccount = "router-admin"

export interface RouterAuthRecord {
  readonly credential: string
  readonly sessionCookie: string
  readonly sessionSavedAt: string
}

export interface RouterCredentialEntry {
  readonly getPassword: () => Promise<string | null | undefined>
  readonly setPassword: (password: string) => Promise<void>
  readonly deleteCredential: () => Promise<boolean>
}

export type RouterCredentialEntryFactory = () => RouterCredentialEntry

export class CredentialReadError extends Error {
  readonly _tag = "CredentialReadError"

  constructor(readonly cause: unknown) {
    super("Could not read router credential")
  }
}

export class CredentialWriteError extends Error {
  readonly _tag = "CredentialWriteError"

  constructor(readonly cause: unknown) {
    super("Could not write router credential")
  }
}

export class CredentialDeleteError extends Error {
  readonly _tag = "CredentialDeleteError"

  constructor(readonly cause: unknown) {
    super("Could not delete router credential")
  }
}

const defaultEntryFactory: RouterCredentialEntryFactory = () => new AsyncEntry(credentialService, credentialAccount)

const isRouterAuthRecord = (value: unknown): value is RouterAuthRecord => {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const record = value as Partial<RouterAuthRecord>
  return typeof record.credential === "string" && record.credential.length > 0 &&
    typeof record.sessionCookie === "string" && record.sessionCookie.length > 0 &&
    typeof record.sessionSavedAt === "string" && record.sessionSavedAt.length > 0
}

export const parseRouterAuthRecord = (value: string | null | undefined): RouterAuthRecord | null => {
  if (value === null || value === undefined) {
    return null
  }

  try {
    const parsedValue = JSON.parse(value) as unknown
    return isRouterAuthRecord(parsedValue) ? parsedValue : null
  } catch {
    return null
  }
}

const isMissingCredentialError = (error: unknown) => {
  if (typeof error !== "object" || error === null) {
    return false
  }

  const name = "name" in error ? String(error.name) : ""
  const message = "message" in error ? String(error.message) : ""
  return /no[\s_-]?entry|not[\s_-]?found/i.test(`${name} ${message}`)
}

export const getRouterAuthRecord = (entryFactory: RouterCredentialEntryFactory = defaultEntryFactory) =>
  Effect.tryPromise({
    try: async () => {
      try {
        return parseRouterAuthRecord(await entryFactory().getPassword())
      } catch (error) {
        if (isMissingCredentialError(error)) {
          return null
        }

        throw error
      }
    },
    catch: (error) => new CredentialReadError(error)
  })

export const setRouterAuthRecord = (
  record: RouterAuthRecord,
  entryFactory: RouterCredentialEntryFactory = defaultEntryFactory
) =>
  Effect.tryPromise({
    try: () => entryFactory().setPassword(JSON.stringify(record)),
    catch: (error) => new CredentialWriteError(error)
  })

export const deleteRouterCredential = (entryFactory: RouterCredentialEntryFactory = defaultEntryFactory) =>
  Effect.tryPromise({
    try: () => entryFactory().deleteCredential(),
    catch: (error) => new CredentialDeleteError(error)
  })
