# @nuxtjp/dependency-security

Configure reviewed pnpm dependency backports and test the application's active
installed implementations. This package has no Nuxt or Vue peer dependencies: a
Nuxt 3/Vuetify or Nuxt 4 application can use the same explicit maintenance tool.
It does not inspect arbitrary source, monitor endpoints, install dependencies,
contact a registry or silently modify a project during installation.

```sh
pnpm add -D @nuxtjp/dependency-security@0.1.0
pnpm exec nuxtjp-security-config --project-root . --apply
pnpm install --no-frozen-lockfile
pnpm install --frozen-lockfile
pnpm exec nuxtjp-security-check --project-root .
pnpm audit --json
```

The preset requires an installed Nuxt host with the selected braces, node-forge
and simple-git targets. A bare core-only library graph does not need these
backports, and an absent target remains an error rather than a passing check.
Use an initial install with `--ignore-scripts` before configuring a new host.

Commit the generated `.nuxtjp-security` patches, manifest and lockfile. Run the
check after every locked install. Configuration refuses conflicting patches,
symlink storage and concurrent manifest changes; unrelated settings are retained.
The check loads the explicitly installed braces/node-forge implementations and
exercises bounded recursion and malformed RSA signature cases. It creates a
never-issued ephemeral test key in memory and never reads an account key.

Two upstream advisories currently have no fixed registry version:
GHSA-vfj7-8cjw-p6xm (braces 3.0.3) and GHSA-86w9-cpqp-85rv (node-forge 1.4.0).
Version-only audit findings remain visible. Tested patches supplement those
releases; every other advisory blocks validation. Exact fixed override versions
for simple-git, its argument parser and esbuild live in `dependency-versions.json`.
The simple-git compatibility patch preserves Nuxt devtools' legacy default factory
while using the fixed upstream implementation. Verify an actual host build and
types with devtools enabled; this tool does not certify an application by itself.

## Typed API

```ts
import { applySecurityPatches, installedDependencies } from '@nuxtjp/dependency-security'
applySecurityPatches('/explicit/application')
const active = installedDependencies('/explicit/application', 'braces', '3.0.3')
```

A missing target or an installed dependency resolving outside the selected project
is an error. The API does not execute installs or inspected application scripts.
The caller must own and explicitly select the project; this is not an OS sandbox
against another process with the same user privileges.

[LICENSE](LICENSE) and [NOTICE](NOTICE) describe this tool's license. The unchanged
LICENSE-braces, LICENSE-node-forge and LICENSE-simple-git files retain upstream
patch-input attribution and redistribution terms.
