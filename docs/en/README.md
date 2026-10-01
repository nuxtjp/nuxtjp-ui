# NuxtJP UI

`@nuxtjp/ui` is an independent Nuxt 4 module built on Nuxt UI. It supplies a Japanese-first
theme, semantic tokens, locale integration, prefixed presentation components, and a traceable
profile of selected Digital Agency Design System guidance.

It is not an official or certified implementation of Nuxt or the Digital Agency. Adoption does
not establish accessibility conformance; consuming services retain page-level verification.

## Boundary

- `@nuxtjp/ui` owns theme policy, generic UI components, locale, and pure presentation helpers.
- `@nuxtjp/management-layout` owns reusable dashboard layout and navigation framing.
- consuming applications own routes, data access, authorization, mutations, and business states.

Install the module and wrap the application once with `NuxtJpApp`.

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjp/ui'],
  nuxtJpUi: { locale: 'ja' }
})
```

The public components include page headers, read states, metric grids, status badges, copy
fallback, skip links, and a generic process stepper. Product-specific steps and operations remain
in the consuming application.

See the [style guide](./style-guide.md), [conformance status](./conformance.md), and
[upstream governance](./governance.md). Source directories are never a consumer dependency;
local integration uses a versioned package tarball.
