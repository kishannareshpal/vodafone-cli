export interface RouterSession {
  readonly cookieHeader: string
}

export class CookieJar {
  private readonly cookies = new Map<string, string>()

  constructor(session?: RouterSession) {
    if (session !== undefined) {
      this.storeCookieHeader(session.cookieHeader)
    }
  }

  get header() {
    return [...this.cookies].map(([name, value]) => `${name}=${value}`).join("; ")
  }

  get session(): RouterSession {
    return { cookieHeader: this.header }
  }

  store(headers: Headers) {
    const setCookieHeaders = typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : headers.get("set-cookie") === null
      ? []
      : [headers.get("set-cookie") as string]

    for (const header of setCookieHeaders) {
      const [cookie] = header.split(";")
      const separatorIndex = cookie.indexOf("=")

      if (separatorIndex > 0) {
        this.cookies.set(cookie.slice(0, separatorIndex), cookie.slice(separatorIndex + 1))
      }
    }
  }

  private storeCookieHeader(cookieHeader: string) {
    for (const cookie of cookieHeader.split(";")) {
      const trimmedCookie = cookie.trim()
      const separatorIndex = trimmedCookie.indexOf("=")

      if (separatorIndex > 0) {
        this.cookies.set(trimmedCookie.slice(0, separatorIndex), trimmedCookie.slice(separatorIndex + 1))
      }
    }
  }
}

export const joinRouterUrl = (baseUrl: string, pathname: string) => new URL(pathname, `${baseUrl}/`).toString()

export const fetchWithCookies = async (url: string, init: RequestInit, cookies: CookieJar) => {
  const headers = new Headers(init.headers)

  if (cookies.header !== "") {
    headers.set("cookie", cookies.header)
  }

  const response = await fetch(url, { ...init, headers })
  cookies.store(response.headers)
  return response
}
