# vodafone-cli

CLI for reading Vodafone router information from the local admin UI.

```sh
npm i -g vodafone-cli
```

or:

```sh
npm install -g vodafone-cli
```

```sh
vodafone-cli login
vodafone-cli devices list
```

The short alias is also available:

```sh
vf devices list --json
```

Example output:

```text
Name          IP             MAC                Connection  SSID          Signal
Work MacBook  192.168.1.42   AA:BB:CC:DD:EE:01 Wi-Fi       Vodafone1234  -48 dBm
Desk PC       192.168.1.87   AA:BB:CC:DD:EE:02 Ethernet    -             -
Pixel 8       192.168.1.91   AA:BB:CC:DD:EE:03 Wi-Fi       Vodafone1234  -61 dBm
```

## Configuration

The default router URL is `http://192.168.1.1`.

```sh
vf config get router-url
vf config set router-url http://192.168.1.1
```

`login` verifies the router admin credential with SRP, then stores the credential and cached session in the OS keychain.

## Development

```sh
pnpm install
pnpm tsx src/bin.ts --help
pnpm test
pnpm run check
pnpm run lint
pnpm run build
```

`pnpm install` runs Husky setup through the `prepare` script. The pre-commit hook runs `lint-staged`.

## Release

Use the `Release Package` GitHub Actions workflow for versioned npm releases. A non-dry run verifies the package, builds `dist`, publishes to npm, tags the commit, and creates the GitHub Release.

Publishing an existing GitHub Release also runs the same workflow. The release tag must match `package.json`, for example `v1.0.0`.
