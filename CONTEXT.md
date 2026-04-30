# Vodafone Router CLI

A command-line interface for reading operational information from a Vodafone router admin interface on the local network.

## Language

**Connected Device**:
A device currently connected to the Vodafone router over Wi-Fi or Ethernet.
_Avoid_: Client, host, attached device

**Known Device**:
A device remembered by the router but not necessarily connected right now.
_Avoid_: Connected device, historical device

**Router Credential**:
The secret material required to authenticate with the Vodafone router admin interface.
_Avoid_: Password when the router may require more than a password

**Router Username**:
The username sent during **SRP Login** for the active Vodafone router firmware.
_Avoid_: User-configurable account until another firmware requires it

**Credential Store**:
The operating system-backed keychain used by the CLI to persist **Router Credentials**.
_Avoid_: Config file, plain-text store

**Credential Backend**:
The package-level implementation used to access the **Credential Store**.
_Avoid_: Domain model when referring to storage implementation

**Credential Entry**:
The named keychain record where the CLI stores the active **Router Auth Record**.
_Avoid_: Config key, router URL scoped credential

**Router Auth Record**:
The single JSON value in the **Credential Entry** containing the **Router Credential**, cached session cookie, and session timestamp.
_Avoid_: Multiple keychain entries, config file session

**Login**:
The CLI workflow that stores a **Router Credential** for later router commands.
_Avoid_: Auth when referring to saved credential setup

**Credential Prompt**:
The secure command-line input flow that collects a **Router Credential** without echoing it.
_Avoid_: Password flag, visible input

**Router URL**:
The base URL used to reach the Vodafone router admin interface.
_Avoid_: Host when the full URL is required

**Router Configuration**:
The non-secret CLI configuration that stores the global **Router URL**.
_Avoid_: Credential store, keychain

**User Config File**:
The per-user file that persists **Router Configuration** outside the repository.
_Avoid_: Project config, repo config

**Config Command**:
The CLI workflow that reads or writes non-secret **Router Configuration**.
_Avoid_: Login, credential command

**Device List Command**:
The CLI workflow that prints **Connected Devices**.
_Avoid_: Known-device command, client list

**Device Output**:
The presentation of **Connected Devices** returned by the **Device List Command**.
_Avoid_: Raw router response

**Router HTTP Contract**:
The verified request and response behavior used by the CLI to authenticate and read router data.
_Avoid_: Guessed API, assumed endpoint

**SRP Login**:
The router authentication flow that proves knowledge of the **Router Credential** without directly posting it as a password.
_Avoid_: Plain password POST

**SRP Client Proof**:
The derived proof sent to the router during **SRP Login** after receiving the router's salt and server public key.
_Avoid_: Password hash, encrypted password

**Authentication Throttle**:
The router state where malformed or failed authentication attempts temporarily block admin UI requests.
_Avoid_: Network outage when the router is intentionally refusing UI requests

**Authenticated Discovery**:
The process of using a verified **SRP Login** session to identify protected router endpoints.
_Avoid_: Blind endpoint probing, unauthenticated guessing

**CLI Alias**:
An alternate executable name that invokes the same CLI.
_Avoid_: Command alias when referring to package-level executables

**CLI Framework**:
The library that defines command parsing, help output, and command execution.
_Avoid_: oclif when referring to this project

## Relationships

- A **Connected Device** may also be a **Known Device**
- A **Known Device** is not necessarily a **Connected Device**
- A **Router Auth Record** is persisted in the **Credential Store**
- The CLI retrieves a **Router Auth Record** from the **Credential Store** before reading protected router data
- The **Credential Backend** is `@napi-rs/keyring`
- The **Credential Entry** uses service `vodafone-cli` and account `router-admin`
- The CLI uses one **Credential Entry** only
- The **Router Auth Record** stores the **Router Credential** and cached router session cookie
- The CLI accesses the **Credential Store** through a local credentials module
- The current **Router Username** is `vodafone`
- A **Login** writes one **Router Auth Record** to the **Credential Store**
- **Login** saves a **Router Auth Record** only after **SRP Login** succeeds
- **Login** collects the **Router Credential** through a hidden **Credential Prompt**
- **Login** is implemented as the `login` command
- `--password-stdin` may supply a **Router Credential** for scripting and tests
- Commands must not accept **Router Credentials** through visible flags
- A connected-device command requires a valid **Router Auth Record**
- The default **Router URL** is `http://192.168.1.1`
- The active **Router URL** is stored in **Router Configuration**
- Commands read the global **Router URL** from **Router Configuration**
- **Router Configuration** is persisted in a **User Config File**
- The **User Config File** stores non-secret values only
- A **Config Command** can read or write the saved **Router URL**
- **Login** does not write **Router Configuration**
- The first implementation slice is the **Config Command** for `router-url`
- The `vf` **CLI Alias** invokes the same CLI as `vodafone-cli`
- The **CLI Framework** is `@effect/cli`
- **SRP Login** is implemented in `src/router/Srp.ts` and `src/router/RouterAuth.ts`
- The router receives an **SRP Client Proof**, not the raw **Router Credential**
- The router's server proof is verified before **Login** stores the **Router Auth Record**
- The `devices list` **Device List Command** returns **Connected Devices**
- **Device Output** defaults to a human-readable table
- **Device Output** supports JSON for scripting
- Empty **Device Output** is successful and exits with code `0`
- The Wi-Fi device endpoint is `GET /modals/overview.lp?status=wifiInfo&auto_update=true`
- The Ethernet device endpoint is `GET /modals/overview.lp?status=networkInfo&auto_update=true`
- Router device rows with `State === "1"` are **Connected Devices**
- **Device List Command** tries the cached session first, then refreshes once with **SRP Login** if the session expired
- Router connection, authentication, and parsing failures are command failures
- The **Router HTTP Contract** is discovered by inspecting real admin UI network traffic
- Structured JSON or XHR endpoints are preferred over HTML scraping
- The Vodafone Wi-Fi Hub uses **SRP Login** at `/authenticate`
- The router can enter **Authentication Throttle** after malformed authentication requests
- **Authenticated Discovery** happens only after the CLI can perform **SRP Login**
- **Router Credentials** must not be pasted into chat, logs, fixtures, or documentation

## Example dialogue

> **Dev:** "Should `devices list` include a phone that connected yesterday but is offline now?"
> **Domain expert:** "No - `devices list` should show **Connected Devices** only. Historical router entries are **Known Devices** and can be exposed separately later."
>
> **Dev:** "Should users pass the router password every time?"
> **Domain expert:** "No - save the **Router Credential** in the **Credential Store** and reuse it for later commands."
>
> **Dev:** "Which implementation should access the operating system keychain?"
> **Domain expert:** "Use `@napi-rs/keyring` as the **Credential Backend** behind a small wrapper."
>
> **Dev:** "What keychain record should hold the router admin credential?"
> **Domain expert:** "Use a single **Credential Entry** with service `vodafone-cli` and account `router-admin`."
>
> **Dev:** "Should commands call `@napi-rs/keyring` directly?"
> **Domain expert:** "No - use the local credentials module so command code depends on project language instead of backend APIs."
>
> **Dev:** "Should **Login** save a password before testing it?"
> **Domain expert:** "No - verify the **Router Credential** with **SRP Login** first, then save it."
>
> **Dev:** "Can users pass the password as a flag?"
> **Domain expert:** "No - use a hidden **Credential Prompt** by default and `--password-stdin` only for scripting."
>
> **Dev:** "Should users configure the router username?"
> **Domain expert:** "Not yet - this firmware uses **Router Username** `vodafone`, so keep it internal for now."
>
> **Dev:** "What should happen if `devices list` runs before `login`?"
> **Domain expert:** "Fail clearly and tell the user to run **Login** first."
>
> **Dev:** "Is the router always at `http://192.168.1.1`?"
> **Domain expert:** "Use that as the default **Router URL**, but store changes in global **Router Configuration** rather than passing it on every command."
>
> **Dev:** "Should the router URL be committed to the repo?"
> **Domain expert:** "No - persist it in a per-user **User Config File** and keep secrets in the **Credential Store**."
>
> **Dev:** "Should changing the router URL happen during **Login**?"
> **Domain expert:** "No - use a **Config Command** such as `config set router-url <url>` and keep **Login** focused on **Router Credentials**."
>
> **Dev:** "What should we implement first after moving to Effect CLI?"
> **Domain expert:** "Start with the **Config Command** for `router-url`, then use that foundation for **Login**."
>
> **Dev:** "What command should show devices?"
> **Domain expert:** "Use `devices list` as the **Device List Command**. The short form is `vf devices list` through the **CLI Alias**."
>
> **Dev:** "Should this project keep the generated oclif scaffold?"
> **Domain expert:** "No - use the official Effect CLI template and `@effect/cli` as the **CLI Framework**."
>
> **Dev:** "Should `devices list` print the router response exactly?"
> **Domain expert:** "No - format **Device Output** as a table by default and support JSON for scripts."
>
> **Dev:** "Is an empty device list an error?"
> **Domain expert:** "No - table output should say no **Connected Devices** were found, JSON output should be `[]`, and the command should exit successfully."
>
> **Dev:** "Can we infer the endpoint from another Vodafone router?"
> **Domain expert:** "No - verify the **Router HTTP Contract** against this router by inspecting browser network traffic."
>
> **Dev:** "Can the CLI just POST the admin password to `/authenticate`?"
> **Domain expert:** "No - the router uses **SRP Login**, and malformed auth requests may trigger **Authentication Throttle**."
>
> **Dev:** "How should we find the connected-device endpoint?"
> **Domain expert:** "Implement **SRP Login** first, then use **Authenticated Discovery** with the locally stored **Router Credential**."

## Flagged ambiguities

- "devices connected" was resolved to mean **Connected Devices** only, excluding **Known Devices** that are offline.
- "password / credential" was resolved to **Router Credential** because the router may require password-only or username/password authentication.
- "keychain package" was resolved to `@napi-rs/keyring` as the **Credential Backend**.
- "keychain service/account" was resolved to one **Credential Entry**: service `vodafone-cli`, account `router-admin`.
- "credential-store wrapper" was resolved to `src/credentials/`, backed by `@napi-rs/keyring`.
- "login save timing" was resolved to verified save: **Login** writes the **Router Credential** only after successful **SRP Login**.
- "password input" was resolved to a hidden **Credential Prompt** with `--password-stdin` for scripting and tests.
- "router username" was resolved to internal **Router Username** `vodafone` for the currently observed firmware.
- "alias" was resolved to mean package-level **CLI Alias**, specifically `vf`.
- "CLI framework" was resolved to `@effect/cli`; the oclif scaffold was scrapped.
- "`router-url` configuration" was resolved to global **Router Configuration**, not a repeated command flag.
- "configuration file" was resolved to a per-user **User Config File**, with `~/.config/vodafone-cli/config.json` on macOS/Linux and the equivalent app config directory on Windows.
- "change router URL" was resolved to a **Config Command** workflow, specifically `config set router-url <url>` and `config get router-url`.
- "first implementation slice" was resolved to the **Config Command** for `router-url`.
- "connected-device command" was resolved to the **Device List Command**, specifically `devices list`.
- "output format" was resolved to **Device Output**: a human-readable table by default and JSON for scripts.
- "empty device list" was resolved as valid empty **Device Output**, not a failure.
- "router API" was resolved to **Router HTTP Contract**, which must be verified from real admin UI traffic.
- "login request" was resolved as **SRP Login**, not a plain password POST.
- "authenticated endpoint discovery" was resolved to **Authenticated Discovery**, using a verified **SRP Login** session and never sharing **Router Credentials** in chat.
