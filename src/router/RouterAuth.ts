import * as Effect from "effect/Effect"

import { CookieJar, fetchWithCookies, joinRouterUrl } from "./RouterHttp.js"
import { createClientChallenge, createClientProof, routerUsername } from "./Srp.js"

export class RouterAuthError extends Error {
  readonly _tag = "RouterAuthError"

  constructor(message: string, readonly cause?: unknown) {
    super(message)
  }
}

interface RouterAuthResponse {
  readonly s?: string
  readonly B?: string
  readonly M?: string
  readonly error?: unknown
  readonly waitTime?: number
}

const parseCsrfToken = (html: string) => html.match(/name=["']CSRFtoken["']\s+content=["']([^"']+)["']/i)?.[1]

const formBody = (values: Record<string, string>) => {
  const body = new URLSearchParams()

  for (const [key, value] of Object.entries(values)) {
    body.set(key, value)
  }

  return body
}

const readJson = async (response: Response): Promise<RouterAuthResponse> => {
  const text = await response.text()

  try {
    return JSON.parse(text) as RouterAuthResponse
  } catch (error) {
    throw new RouterAuthError(`Router returned non-JSON authentication response with status ${response.status}`, error)
  }
}

const assertOk = (response: Response) => {
  if (!response.ok) {
    throw new RouterAuthError(`Router authentication request failed with status ${response.status}`)
  }
}

const assertNoRouterError = (response: RouterAuthResponse) => {
  if (response.error !== undefined) {
    const suffix = response.waitTime === undefined ? "" : ` Try again in ${response.waitTime} seconds.`
    throw new RouterAuthError(`Router rejected the credential.${suffix}`)
  }
}

const authenticateRouterPromise = async (routerUrl: string, password: string) => {
  const cookies = new CookieJar()
  const loginResponse = await fetchWithCookies(joinRouterUrl(routerUrl, "/"), { method: "GET" }, cookies)
  assertOk(loginResponse)

  const csrfToken = parseCsrfToken(await loginResponse.text())

  if (csrfToken === undefined) {
    throw new RouterAuthError("Router login page did not include a CSRF token")
  }

  const challenge = createClientChallenge()
  const challengeResponse = await fetchWithCookies(
    joinRouterUrl(routerUrl, "/authenticate"),
    {
      method: "POST",
      body: formBody({
        CSRFtoken: csrfToken,
        I: routerUsername,
        A: challenge.publicKey
      })
    },
    cookies
  )
  assertOk(challengeResponse)

  const serverChallenge = await readJson(challengeResponse)
  assertNoRouterError(serverChallenge)

  if (serverChallenge.s === undefined || serverChallenge.B === undefined) {
    throw new RouterAuthError("Router authentication challenge was missing SRP fields")
  }

  const proof = createClientProof({
    privateKey: challenge.privateKey,
    publicKey: challenge.publicKey,
    username: routerUsername,
    password,
    salt: serverChallenge.s,
    serverPublicKey: serverChallenge.B
  })

  const proofResponse = await fetchWithCookies(
    joinRouterUrl(routerUrl, "/authenticate"),
    {
      method: "POST",
      body: formBody({
        CSRFtoken: csrfToken,
        M: proof.proof
      })
    },
    cookies
  )
  assertOk(proofResponse)

  const serverProof = await readJson(proofResponse)
  assertNoRouterError(serverProof)

  if (serverProof.M?.toLowerCase() !== proof.expectedServerProof.toLowerCase()) {
    throw new RouterAuthError("Router authentication proof could not be verified")
  }

  return cookies.session
}

export const authenticateRouter = (routerUrl: string, password: string) =>
  Effect.tryPromise({
    try: () => authenticateRouterPromise(routerUrl, password),
    catch: (error) =>
      error instanceof RouterAuthError
        ? error
        : new RouterAuthError("Router authentication failed", error)
  })
