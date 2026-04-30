import * as Command from "@effect/cli/Command"
import * as Options from "@effect/cli/Options"
import * as Prompt from "@effect/cli/Prompt"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as Redacted from "effect/Redacted"

import { readRouterConfig } from "../config/RouterConfig.js"
import { setRouterAuthRecord } from "../credentials/RouterCredentials.js"
import { authenticateRouter } from "../router/RouterAuth.js"

const passwordStdin = Options.boolean("password-stdin").pipe(
  Options.withDescription("Read the router admin password from stdin.")
)

const readPasswordFromStdin = Effect.tryPromise({
  try: async () => {
    const chunks: Array<Buffer> = []

    for await (const chunk of process.stdin) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }

    const value = Buffer.concat(chunks).toString("utf8").replace(/\r?\n$/, "")

    if (value.length === 0) {
      throw new Error("Router credential cannot be empty")
    }

    return value
  },
  catch: (error) => error instanceof Error ? error : new Error("Could not read password from stdin")
})

const promptForPassword = Prompt.password({
  message: "Router admin password: ",
  validate: (value) =>
    value.length === 0
      ? Effect.fail("Router credential cannot be empty")
      : Effect.succeed(value)
}).pipe(
  Prompt.run,
  Effect.map((password) => Redacted.value(password))
)

const reportLoginError = (error: Error) =>
  Console.error(error.message).pipe(
    Effect.zipRight(Effect.sync(() => {
      process.exitCode = 1
    }))
  )

export const login = Command.make("login", { passwordStdin }, ({ passwordStdin }) =>
  Effect.gen(function*() {
    const password = yield* (passwordStdin ? readPasswordFromStdin : promptForPassword)
    const config = yield* readRouterConfig

    const session = yield* authenticateRouter(config.routerUrl, password)
    yield* setRouterAuthRecord({
      credential: password,
      sessionCookie: session.cookieHeader,
      sessionSavedAt: new Date().toISOString()
    })
    yield* Console.log("Login successful. Router credential and session saved to the OS keychain.")
  }).pipe(
    Effect.catchTags({
      ConfigReadError: reportLoginError,
      CredentialWriteError: reportLoginError,
      RouterAuthError: reportLoginError
    }),
    Effect.catchAll(reportLoginError)
  )).pipe(Command.withDescription("Verify and save the router admin credential and session."))
