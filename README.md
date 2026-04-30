vodafone-cli
=================

Vodafone router CLI


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/vodafone-cli.svg)](https://npmjs.org/package/vodafone-cli)
[![Downloads/week](https://img.shields.io/npm/dw/vodafone-cli.svg)](https://npmjs.org/package/vodafone-cli)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g vodafone-cli
$ vodafone-cli COMMAND
running command...
$ vodafone-cli (--version)
vodafone-cli/0.0.0 darwin-arm64 node-v24.15.0
$ vodafone-cli --help [COMMAND]
USAGE
  $ vodafone-cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`vodafone-cli hello PERSON`](#vodafone-cli-hello-person)
* [`vodafone-cli hello world`](#vodafone-cli-hello-world)
* [`vodafone-cli help [COMMAND]`](#vodafone-cli-help-command)
* [`vodafone-cli plugins`](#vodafone-cli-plugins)
* [`vodafone-cli plugins add PLUGIN`](#vodafone-cli-plugins-add-plugin)
* [`vodafone-cli plugins:inspect PLUGIN...`](#vodafone-cli-pluginsinspect-plugin)
* [`vodafone-cli plugins install PLUGIN`](#vodafone-cli-plugins-install-plugin)
* [`vodafone-cli plugins link PATH`](#vodafone-cli-plugins-link-path)
* [`vodafone-cli plugins remove [PLUGIN]`](#vodafone-cli-plugins-remove-plugin)
* [`vodafone-cli plugins reset`](#vodafone-cli-plugins-reset)
* [`vodafone-cli plugins uninstall [PLUGIN]`](#vodafone-cli-plugins-uninstall-plugin)
* [`vodafone-cli plugins unlink [PLUGIN]`](#vodafone-cli-plugins-unlink-plugin)
* [`vodafone-cli plugins update`](#vodafone-cli-plugins-update)

## `vodafone-cli hello PERSON`

Say hello

```
USAGE
  $ vodafone-cli hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ vodafone-cli hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/kishannareshpal/vodafone-cli/blob/v0.0.0/src/commands/hello/index.ts)_

## `vodafone-cli hello world`

Say hello world

```
USAGE
  $ vodafone-cli hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ vodafone-cli hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/kishannareshpal/vodafone-cli/blob/v0.0.0/src/commands/hello/world.ts)_

## `vodafone-cli help [COMMAND]`

Display help for vodafone-cli.

```
USAGE
  $ vodafone-cli help [COMMAND...] [-n]

ARGUMENTS
  [COMMAND...]  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for vodafone-cli.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/6.2.45/src/commands/help.ts)_

## `vodafone-cli plugins`

List installed plugins.

```
USAGE
  $ vodafone-cli plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ vodafone-cli plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.62/src/commands/plugins/index.ts)_

## `vodafone-cli plugins add PLUGIN`

Installs a plugin into vodafone-cli.

```
USAGE
  $ vodafone-cli plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into vodafone-cli.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the VODAFONE_CLI_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the VODAFONE_CLI_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ vodafone-cli plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ vodafone-cli plugins add myplugin

  Install a plugin from a github url.

    $ vodafone-cli plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ vodafone-cli plugins add someuser/someplugin
```

## `vodafone-cli plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ vodafone-cli plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ vodafone-cli plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.62/src/commands/plugins/inspect.ts)_

## `vodafone-cli plugins install PLUGIN`

Installs a plugin into vodafone-cli.

```
USAGE
  $ vodafone-cli plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into vodafone-cli.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the VODAFONE_CLI_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the VODAFONE_CLI_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ vodafone-cli plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ vodafone-cli plugins install myplugin

  Install a plugin from a github url.

    $ vodafone-cli plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ vodafone-cli plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.62/src/commands/plugins/install.ts)_

## `vodafone-cli plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ vodafone-cli plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ vodafone-cli plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.62/src/commands/plugins/link.ts)_

## `vodafone-cli plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ vodafone-cli plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ vodafone-cli plugins unlink
  $ vodafone-cli plugins remove

EXAMPLES
  $ vodafone-cli plugins remove myplugin
```

## `vodafone-cli plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ vodafone-cli plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.62/src/commands/plugins/reset.ts)_

## `vodafone-cli plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ vodafone-cli plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ vodafone-cli plugins unlink
  $ vodafone-cli plugins remove

EXAMPLES
  $ vodafone-cli plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.62/src/commands/plugins/uninstall.ts)_

## `vodafone-cli plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ vodafone-cli plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ vodafone-cli plugins unlink
  $ vodafone-cli plugins remove

EXAMPLES
  $ vodafone-cli plugins unlink myplugin
```

## `vodafone-cli plugins update`

Update installed plugins.

```
USAGE
  $ vodafone-cli plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.62/src/commands/plugins/update.ts)_
<!-- commandsstop -->
