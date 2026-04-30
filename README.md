# vodafone-cli

CLI for reading Vodafone router information from the local admin UI.

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
