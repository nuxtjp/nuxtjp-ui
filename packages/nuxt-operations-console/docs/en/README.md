# @nuxtjp/operations-console

[日本語](../../README.md)

A small Nuxt 4 module for presenting credential readiness, network
observations, network-control evaluation receipts, and a safe topology
projection. It recognizes versioned
Crowsi contracts but has no source-path or runtime dependency on Crowsi.

## Install and compose

```bash
pnpm add ./vendor/nuxtjp-operations-console-0.2.1.tgz
```

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjp/operations-console']
})
```

Use the combined console or only the projection a product needs:

```vue
<NuxtJpOperationsConsole
  :credential-readiness="credentialDocument"
  :network-observations="observationDocument"
  :network-controls="controlDocument"
  :control-coverage="coverageDocument"
/>
<NuxtJpCredentialReadinessPanel :document="credentialDocument" />
<NuxtJpNetworkObservationsPanel :document="observationDocument" />
<NuxtJpNetworkControlsPanel :document="controlDocument" />
<NuxtJpControlCoveragePanel :document="coverageDocument" />
<NuxtJpNetworkTopologyPanel :document="topologyDocument" />
```

Japanese labels are the default. Set `locale="en"` for English.

## Contracts

- `crowsi://credentials/status/v1`
- `crowsi://network/observations/v1`
- `crowsi://network/control-receipts/v1`
- `crowsi://network/control-coverage-snapshot/v2`
- `nuxtjp://operations/network-topology/v1`

Schemas are exported from the five
`@nuxtjp/operations-console/schema/*` paths. Types, guards, labels, validation,
and summaries are exported from `@nuxtjp/operations-console/core`.

Control coverage is optional and remains in a dedicated panel instead of being
mixed into the existing summary. A snapshot older than five minutes displays
zero controlled assets, unknown asset states, and unverified isolation
readiness. The panel exposes findings but no mutation controls.

Runtime guards verify counts, unique identifiers, bounded collections,
canonical UTC millisecond timestamps, and one immutable dry-run receipt per
decision. Validated data is detached and frozen. Projections older than five
minutes cannot produce an overall `ready` state.

## Security and verification

Credential documents have no dedicated secret field, but a schema cannot prove
that a producer did not mislabel sensitive text. Authenticate the producer,
enforce metadata-only generation, and apply transport byte limits. The module
never probes a host or exposes a control button. Topology lines represent
observation relationships, not packet reachability. Live, declared, and
not-connected evidence are visually distinct. See [SECURITY.md](SECURITY.md).

```bash
pnpm install --offline --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm exec nuxt dev playground --host 127.0.0.1
```

Stop the playground after verification. Consumers must use pinned artifacts,
not a Crowsi source-tree path. NuxtJP is an independent Japanese Nuxt community
and is not represented as an upstream-certified official localization.
