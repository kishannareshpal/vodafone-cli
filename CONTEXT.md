# Vodafone CLI Context

This repository contains a TypeScript CLI for reading information from a Vodafone router admin UI on the local network.

The current product focus is narrow: authenticate with the router, persist the login material securely, and expose currently connected devices from the command line.

## Product Scope

- Primary executable: `vodafone-cli`
- Short alias: `vf`
- Default router URL: `http://192.168.1.1`
- Main user flow:
  - `vodafone-cli login`
  - `vodafone-cli devices list`
- `devices list` returns devices that are connected now. Historical or remembered router clients are not included.
- Human output is a compact table. `--json` prints normalized device objects for scripts.

## Router Contract

Verified against the local Vodafone Wi-Fi Hub on 2026-04-30:

- Router username is `vodafone`.
- Authentication uses SRP at `/authenticate`.
- The login page exposes a CSRF token in `meta[name="CSRFtoken"]`.
- Connected-device data comes from:
  - `GET /modals/overview.lp?status=wifiInfo&auto_update=true`
  - `GET /modals/overview.lp?status=networkInfo&auto_update=true`
- Router device rows include both known and connected devices.
- `State === "1"` means the device is currently connected.
- Malformed authentication attempts can cause temporary `503 Service Temporarily Unavailable` responses.

Do not run live router probing unless the user explicitly asks. If discovery is needed, authenticate first and keep requests conservative.

## Authentication And Storage

- Router credentials are verified with SRP before being saved.
- The raw router password must never be written to repo files, config files, logs, fixtures, snapshots, README examples, or chat.
- Commands must not accept a visible password flag.
- `login` uses a hidden prompt by default.
- `--password-stdin` exists only for scripting and tests.
- Router auth material is stored through `src/credentials/`.
- The credential backend is `@napi-rs/keyring`.
- Use one keychain record only:
  - service: `vodafone-cli`
  - account: `router-admin`
- The keychain value is a single JSON auth record containing:
  - router credential
  - cached session cookie
  - session saved timestamp
- Missing or non-JSON keychain values mean the user is not logged in. Do not add legacy compatibility for older keychain formats.

## Configuration

- Router URL is non-secret configuration.
- It belongs in the user config file, not in the credential store.
- macOS/Linux default path: `~/.config/vodafone-cli/config.json`
- Windows should use the equivalent app config directory.
- `vf config get router-url` prints the active router URL.
- `vf config set router-url <url>` stores a normalized router URL.

## Code Layout

- `src/bin.ts` is the executable entrypoint.
- `src/Cli.ts` defines the command tree.
- `src/CliHelp.ts` owns compact help text.
- `src/commands/` contains CLI command handlers.
- `src/config/` owns non-secret user configuration.
- `src/credentials/` owns OS keychain access.
- `src/router/` owns router HTTP, SRP authentication, and response parsing.
- `scripts/copy-package-json.ts` writes publish metadata into `dist/`.
- `test/` contains Vitest tests.

Keep command handlers thin. Router transport and parsing belongs in `src/router/`; credential storage belongs in `src/credentials/`; user config belongs in `src/config/`.

## Release

- Package version currently lives in `package.json`.
- Build output is generated with `pnpm run build`.
- Publish metadata is copied into `dist/package.json`.
- npm package contents are expected to be `dist/bin.cjs` and `dist/package.json`.
- The release workflow is `.github/workflows/release.yml`.
- Non-dry-run releases verify, build, publish to npm, create a tag, and create a GitHub Release.
- Publishing an existing GitHub Release also triggers the same workflow.

## Verification Commands

Use these before committing functional changes:

```sh
pnpm run lint
pnpm run check
pnpm test
pnpm run build
```

For release packaging checks:

```sh
cd dist
npm pack --dry-run
```
