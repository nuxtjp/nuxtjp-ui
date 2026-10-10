# Architecture

`@nuxtjp/ui` owns Nuxt UI installation, tokens, locale, and reusable primitives. This Layer owns the management shell, navigation resolution, and four-dimensional status presentation. The consumer owns business pages, adapters, permissions, data, and wording.

Dependencies flow in one direction: NuxtJP UI → management Layer → consumer. The Layer registers only the public `@nuxtjp/ui` module contract and does not install Nuxt UI, a DADS theme, or an external-service client directly.

Consumers extend the npm package through [Nuxt Layers](https://nuxt.com/docs/4.x/getting-started/layers). Layer-owned paths resolve from `import.meta.url`, never a working directory or Wonderland-specific absolute path. Consumer files take precedence over Layer files; a consumer override becomes consumer-owned evidence.

The Layer receives declarative route metadata and presentation models. It makes no external request and persists only the UI-managed sidebar size. Authentication, authorization, secrets, personal data, audit, and provider-specific errors remain in the consumer.

Before registry publication, Wonderland root `.artifacts/npm/` is a temporary stage. Each consumer depends only on its own fixed `vendor/*.tgz`, not on the stage or another repository's source tree.
