# @nuxtjp/dependency-security

Configure reviewed pnpm dependency backports and test the application's active
installed implementations. This package has no Nuxt or Vue peer dependencies: a
Nuxt 3/Vuetify or Nuxt 4 application can use the same explicit maintenance tool.
It does not inspect arbitrary source, monitor endpoints, install dependencies,
contact a registry or silently modify a project during installation.

```sh
pnpm add -D @nuxtjp/dependency-security
pnpm exec nuxtjp-security-config --project-root . --apply
pnpm install --no-frozen-lockfile
pnpm install --frozen-lockfile
pnpm exec nuxtjp-security-check --project-root .
pnpm audit --json
```

The preset requires an installed Nuxt host with the selected braces and node-forge
targets. The simple-git compatibility patch applies only when that dependency is
active. Newer DevTools no longer needs it; absence is not a reason to install an
unused Git process library. Present targets still require the reviewed fixed
versions and malformed/escaping graphs fail closed. A bare core-only library
graph does not need these backports.
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

## Version policy 2

Exact generic fixes and major-scoped fixes have one source in
`dependency-versions.json`. Undici's maintained major lines and the current
serialize-javascript and fast-uri majors are pinned separately; configuration never forces an
unrelated major into the same implementation. Broad/conflicting caller overrides
fail before mutation. The check walks the active installed graph, accepts optional
absence only after complete traversal, rejects malformed manifests and rejects
installed majors without a reviewed rule. An absent package is not proof that its
implementation passed a vulnerability regression.

The additional upstream fixes address:
- https://github.com/advisories/GHSA-xjj6-f33q-929c
- https://github.com/advisories/GHSA-4qv8-2p9j-2685
- https://github.com/advisories/GHSA-f72v-6w45-q472
- https://github.com/advisories/GHSA-m5mm-p8h7-m29v
- https://github.com/advisories/GHSA-w74x-v6f9-j3xg
- https://github.com/advisories/GHSA-xhq7-xmqj-769h
- https://github.com/advisories/GHSA-wjr9-j795-jxcr
- https://github.com/advisories/GHSA-333x-w4r6-6crp

Apply the preset, refresh the lockfile, check the actual installed implementations,
and run the owning application's type/build/consumer acceptance. Published fixed
versions do not make Node's bundled HTTP implementation newer; Node security
updates and registry dependencies remain separate responsibilities.

Configuration writes target a single-project package.json. If a selected root
already has pnpm-workspace.yaml, the CLI reports an explicit unsupported-workspace
result before mutation; its owner must project the reviewed rules into that YAML
rather than create competing configuration in package.json. Graph verification
still supports an explicitly selected workspace root. No workspace YAML parser or
second package-manager authority is introduced.
