# Vodafone CLI Agent Notes

## Project

This is a TypeScript Effect CLI for a Vodafone router admin interface.

- Executables: `vodafone-cli` and `vf`
- Default router URL: `http://192.168.1.1`
- Runtime: Node.js `>=18`
- Package manager: `pnpm`
- CLI: `@effect/cli`
- Bundler: `tsup`
- Tests: Vitest

## Commands

- Install: `pnpm install`
- Run locally: `pnpm tsx src/bin.ts --help`
- Build: `pnpm run build`
- Typecheck: `pnpm run check`
- Test: `pnpm test`
- Lint: `pnpm run lint`
- Format: `pnpm run lint-fix`

## Layout

- `src/bin.ts` is the executable entrypoint.
- `src/Cli.ts` defines the command tree.
- `src/commands/` contains CLI command handlers.
- `src/config/` stores non-secret router config.
- `src/credentials/` owns OS keychain access.
- `src/router/` owns router HTTP, SRP auth, and response parsing.
- `test/` contains Vitest tests.
- `scripts/copy-package-json.ts` writes publish metadata into `dist/`.
- `dist/` is generated build output.

## Implementation Rules

- Keep command code thin. Put router transport/parsing in `src/router/`, credential handling in `src/credentials/`, and config handling in `src/config/`.
- Use domain-specific names. Avoid vague names such as `data`, `item`, or `entry` when the domain has a clearer term.
- Do not hardcode router credentials, session cookies, or user-specific network details beyond the safe default router URL.
- Store non-secret router URL config in the user config file, not in the credential store.
- Store router auth material only through `src/credentials/`, backed by `@napi-rs/keyring`.
- Use one keychain record only: service `vodafone-cli`, account `router-admin`.
- The keychain value is a JSON auth record containing the router credential, cached session cookie, and session timestamp.
- Treat a missing or non-JSON auth record as not logged in.
- Do not add visible password flags. `login` may use a hidden prompt or `--password-stdin`.
- Verify credentials with SRP before saving them.
- Never write credentials, session cookies, or raw auth material to repo files, config files, logs, fixtures, snapshots, README examples, or chat.
- Do not run live router probing unless explicitly asked.

## Router Contract

Confirmed against the local Vodafone Wi-Fi Hub on 2026-04-30:

- Router username is `vodafone`.
- SRP auth posts to `/authenticate`.
- The login page exposes a CSRF token in `meta[name="CSRFtoken"]`.
- `GET /modals/overview.lp?status=wifiInfo&auto_update=true` returns Wi-Fi device rows.
- `GET /modals/overview.lp?status=networkInfo&auto_update=true` returns Ethernet device rows.
- Device rows include known and connected devices. `State === "1"` means currently connected.
- `devices list` returns connected devices only.
- Device endpoint reads are sequential. If the cached session is expired, refresh once with SRP and retry.
- Default device output is a compact table. `--json` returns normalized device objects, not raw router responses.
