# @nuxtjp/management-layout

This Nuxt 4 Layer builds a reusable management shell, navigation, breadcrumbs, and status summaries on top of NuxtJP UI. It does not own product pages, APIs, authorization decisions, data, or operational wording.

This repository is not an official or certified implementation of Nuxt, Nuxt UI, or the Digital Agency. `@nuxtjp/ui` owns the [DADS v2.16.0](https://design.digital.go.jp/dads/) foundation. This Layer owns management-page structure only.

## Boundary

```text
@nuxt/ui
  └─ @nuxtjp/ui                    theme, primitives, locale
       └─ @nuxtjp/management-layout shell, navigation, status presentation
            └─ consumer             business pages, APIs, permissions, mapping
```

The Layer registers its declared `@nuxtjp/ui` dependency. Consumers install the versioned package and extend its public entrypoint.

## Installation

Following [Nuxt Layers](https://nuxt.com/docs/4.x/getting-started/layers), install fixed package versions and extend the package name.

```sh
pnpm add @nuxtjp/ui@0.1.0 @nuxtjp/management-layout@0.1.0
```

```ts
export default defineNuxtConfig({
  extends: ['@nuxtjp/management-layout']
})
```

The consumer declares presentation metadata in `app.config.ts`:

```ts
export default defineAppConfig({
  nuxtJpUi: { locale: 'en' },
  nuxtJpManagementLayout: {
    brand: { name: 'Example', mark: 'E', home: '/' },
    routes: [{ id: 'home', label: 'Overview', title: 'Overview', path: '/' }],
    navigation: [{ id: 'main', label: 'General', routeIds: ['home'] }]
  }
})
```

## Local package artifact

Before registry publication, run this from the Wonderland root:

```sh
./bin/nuxtjp-ui-package --refresh-locks
```

The command stages artifacts in Wonderland root `.artifacts/npm/`, copies a fixed tarball into each consumer's `vendor/*.tgz`, and refreshes lockfiles. Consumers use only their own vendored artifact; they never reference the temporary stage or another repository's source tree.

## Verification

```sh
pnpm install --frozen-lockfile
pnpm compliance:verify
pnpm test
pnpm typecheck
pnpm build
pnpm upstream:check
```

The upstream command only detects changes. A mismatch or unavailable source becomes `review-required`; it never updates the lock, dependencies, implementation, or conformance status.

See [architecture](./architecture.md), [style guide](./style-guide.md), [governance](./governance.md), [status](./status.md), and [third-party notices](../../THIRD_PARTY_NOTICES.md). Page-level JIS X 8341-3:2016 AA and WCAG 2.2 A/AA evaluation remains the consuming service's release responsibility.
