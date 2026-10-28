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

The preset requires an installed Nuxt host with the selected braces target. The
node-forge and simple-git patches apply only when their exact reviewed targets are
active. Node-forge 1.4.2 uses its upstream implementation and is checked by the
same RSA regressions; 1.4.0 still needs the backport. Absence is not a reason to install an unused package. Present targets still require the reviewed fixed
versions and malformed/escaping graphs fail closed. A bare core-only library
graph does not need these backports.
Use an initial install with `--ignore-scripts` before configuring a new host.

Commit the generated `.nuxtjp-security` patches, manifest and lockfile. Run the
check after every locked install. Configuration refuses conflicting patches,
symlink storage and concurrent manifest changes; unrelated settings are retained.
The check loads the explicitly installed braces implementation and, when present,
node-forge, and exercises bounded recursion and malformed RSA signature cases. It creates a
never-issued ephemeral test key in memory and never reads an account key.

When deepmerge 4.3.1 is present, the reviewed backport rejects `__proto__`,
`constructor`, and `prototype` keys in both merge inputs. This deliberately
excludes those keys from merged output. Regression tests check both distributed
entry points against poisoned prototypes and ordinary nested and array merges.
The reported issue and proposed remediation are documented at
https://github.com/TehShrike/deepmerge/issues/273. The patch is omitted when
deepmerge is absent, and a different installed version requires review.

The following upstream advisories have no recorded fixed registry version:
GHSA-vfj7-8cjw-p6xm (braces 3.0.3), GHSA-86w9-cpqp-85rv (node-forge 1.4.0)
and GHSA-gcqx-w48m-w2h4 (deepmerge 4.3.1).
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

`verifyAuditedAdvisories(project, ids)` rejects unrelated advisories and reported
backports with no active target, then runs the installed dependency regressions.
This binds version-only audit exceptions to the implementations actually tested.
`verifyAuditReport(project, report)` additionally checks every severity total,
rejects unaccounted findings and preserves zero critical/moderate thresholds.

A missing target or an installed dependency resolving outside the selected project
is an error. The API does not execute installs or inspected application scripts.
The caller must own and explicitly select the project; this is not an OS sandbox
against another process with the same user privileges.

[LICENSE](LICENSE) and [NOTICE](NOTICE) describe this tool's license. The unchanged
LICENSE-braces, LICENSE-node-forge, LICENSE-simple-git and LICENSE-deepmerge files retain upstream
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

### Explicit workspace graph verification

`verifyProject(workspaceRoot, { projects })` checks the aggregate active dependency
graphs of explicitly selected projects, including each project's development
dependencies. Supply the actual owner package manager inventory (for example,
paths returned by `pnpm list -r --depth -1 --json`), including the workspace root
exactly once. The caller owns inventory completeness; this API does not parse
workspace YAML or infer that unselected projects were checked. More than 256
projects, duplicates, missing root, linked manifests, node_modules selections
and paths outside the workspace are refused. Dependencies shared within the
workspace are allowed; external resolutions and missing required dependencies
remain errors. Unreferenced store entries remain excluded.

The configuration CLI still refuses workspace YAML. Its owner updates that native
policy using the public policy export and reviewed patch assets. Graph inspection
does not install dependencies, invoke package lifecycles or grant runtime authority.

The reviewed policy retains fast-uri 3.1.9 for 3.x consumers and selects 4.2.3
for 4.x consumers; it never forces a cross-major SDK update. The 4.x correction
follows the upstream release: https://github.com/fastify/fast-uri/releases/tag/v4.2.3 .
A passing policy check is not an exhaustive advisory audit of unrelated packages.
