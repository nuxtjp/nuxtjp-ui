# @nuxtjp/ui

[日本語](README.ja.md)

Different themes, locales and read states make Japanese services harder to use and maintain. This Nuxt module provides shared components, a DADS-referenced theme and `ja`/`en` locale behavior on Nuxt UI. The application owns routes, APIs, authentication, authorization and business state.

## Install and use

Install the package version `0.1.3` after it is available on npm. Use Nuxt `^4.5.2`, Vue `^3.5.40`, and Node.js 22.19+ or 24.11+.

```sh
pnpm add @nuxtjp/ui@0.1.3
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjp/ui'],
  nuxtJpUi: { locale: 'ja' }
})
```

```vue
<!-- app/app.vue -->
<template><NuxtJpApp><NuxtPage /></NuxtJpApp></template>
```

Register `@nuxtjp/ui` and wrap the app once with `NuxtJpApp`. Set `nuxtJpUi.locale` to `ja` or `en`. The application's `app.config.ts` locale and `ui.colors` take precedence.
Lucide icons are bundled, and Nuxt UI remote font fetching is disabled. Toast time progress is hidden by default; enable `toaster-progress` only where needed.

## Public interfaces and limits

The module supplies shared UI foundations while the application supplies domain behavior. The package exports `@nuxtjp/ui` and the framework-independent types/functions in `@nuxtjp/ui/core`; it does not expose a service or credential API.
See the [public API](https://github.com/nuxtjp/nuxtjp-ui/blob/main/docs/api.md) for implemented components, composables and pure functions.
Nuxt UI `4.11.3` and Nuxt Icon `2.5.1` are pinned and declared as host peers for module resolution.

Projection refresh permits one callback at a time and skips ticks while pending or hidden. The returned readonly `error` ref exposes synchronous and Promise failures; `pending` reports active work. `stop()` and unmount clear scheduling and ignore later outcomes in these refs. The callback owns cancellation and any writes to application state.

This independent implementation is not endorsed or certified by Nuxt or the Digital Agency. It does not guarantee application-level accessibility conformance or full DADS compatibility.

## Development and archive validation

```sh
pnpm install --frozen-lockfile
pnpm compliance:verify
pnpm test
pnpm typecheck
pnpm build
pnpm pack --pack-destination ./artifacts
```

`prepack` repeats the existing compliance/test/type/build gates. A local archive validates packaging, not registry availability.
The [development guide](https://github.com/nuxtjp/nuxtjp-ui/blob/main/docs/development.md) explains archive and consumer checks. Upstream detection does not update dependencies or source.

## License and attribution

The package manifest and [LICENSE](LICENSE) identify Apache-2.0. [LICENSE-PREVIOUS](LICENSE-PREVIOUS) retains the prior MIT notice; previous grants and third-party terms remain recorded in [NOTICE](NOTICE) and [third-party notices](THIRD_PARTY_NOTICES.md).
This README reorganization does not change license files or grants.
DADS guidance, source and asset terms are tracked separately. Logos and official marks are not included.
[Reference versions](https://github.com/nuxtjp/nuxtjp-ui/blob/main/upstream/sources.lock.json) and [conformance status](https://github.com/nuxtjp/nuxtjp-ui/blob/main/docs/conformance/status.md) record coverage and compatibility gaps. Application-level accessibility evidence is still required.

## Consumer dependency security

See [dependency security backports](security/README.md) before installing this package in a Nuxt application. pnpm consumers must explicitly apply the included backports and verify their locked dependency tree; ordinary npm installation does not apply them.
