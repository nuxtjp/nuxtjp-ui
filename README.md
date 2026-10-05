# @nuxtjp/ui

## 日本語: 課題と解決

日本語サービスごとにUIのテーマ、言語、読取状態が異なると、利用と保守が難しくなります。
このNuxt moduleはNuxt UIを基盤に、共通の部品、DADS参照テーマ、`ja`／`en`のlocaleを提供します。
route、API、認証、権限、業務状態は利用アプリが担当します。

## 使い方

対象はNuxt `^4.5.2`、Vue `^3.5.40`、Node.js 22.19以降または24.11以降です。
`0.1.0`は公開準備中です。初回bootstrapとnpm上の配布確認は未完了です。
次のregistry導入は、公開確認後に使用できます。

```sh
pnpm add @nuxtjp/ui@0.1.0
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

アプリのrootで`NuxtJpApp`を一度使います。`app.config.ts`のlocaleと`ui.colors`を優先します。
Lucide collectionは同梱し、Nuxt UIの外部font取得は無効にします。
Toastの時間進捗は既定で非表示です。必要なアプリだけ`toaster-progress`を有効にできます。

## 結果と公開surface

共通UIとlocaleをmoduleで揃え、利用アプリは業務固有の内容に集中できます。
実装済みのcomponent、composable、純粋関数は
[公開API](https://github.com/nuxtjp/nuxtjp-ui/blob/main/docs/api.md)を参照してください。
packageの入口は`@nuxtjp/ui`、framework非依存の型・関数は`@nuxtjp/ui/core`です。
このmoduleは独立実装です。Nuxtやデジタル庁の公式・認証済み製品ではありません。
アプリ全体のaccessibility適合を保証するものではありません。

## English: problem and solution

Different themes, locales and read states make Japanese services harder to use and maintain.
This Nuxt module provides shared components, a DADS-referenced theme and `ja`/`en` locale behavior
on Nuxt UI. The application keeps ownership of routes, APIs, authentication and business state.

## Usage

Use Nuxt `^4.5.2`, Vue `^3.5.40`, and Node.js 22.19+ or 24.11+.
Version `0.1.0` is being prepared; first-publish bootstrap and registry delivery are not complete.
After published availability is confirmed, install the exact version shown above,
register `@nuxtjp/ui` in `nuxt.config.ts`, and wrap the app once with `NuxtJpApp`.
Set `nuxtJpUi.locale` to `ja` or `en`. Application locale and color settings take precedence.

## Result

The module supplies consistent UI foundations while the application supplies its own domain behavior.
The package exports the Nuxt module and `@nuxtjp/ui/core`; it does not expose a service or credential API.
Lucide icons are bundled and Nuxt UI remote font fetching is disabled.
This independent implementation is not endorsed or certified by Nuxt or the Digital Agency.
Application-level accessibility evidence is still required.

## Development and local distribution validation

```sh
pnpm install --frozen-lockfile
pnpm compliance:verify
pnpm test
pnpm typecheck
pnpm build
pnpm pack --pack-destination ./artifacts
```

`prepack` repeats the existing compliance/test/type/build gates.
A local archive validates packaging; it does not establish registry availability.
[Development guide](https://github.com/nuxtjp/nuxtjp-ui/blob/main/docs/development.md)
explains the archive and consumer checks. Upstream detection does not update dependencies or source.

## License and attribution

The current package manifest and `LICENSE` identify Apache-2.0.
`LICENSE-PREVIOUS` retains the prior MIT notice; prior grants and third-party terms remain recorded.
This release preparation changes descriptions only, not license files or grants.
See [LICENSE](LICENSE), [NOTICE](NOTICE), [LICENSE-PREVIOUS](LICENSE-PREVIOUS),
and [third-party notices](THIRD_PARTY_NOTICES.md).

DADS guidance, source and asset terms are tracked separately. Logos and official marks are not included.
[Reference versions](https://github.com/nuxtjp/nuxtjp-ui/blob/main/upstream/sources.lock.json)
and [conformance status](https://github.com/nuxtjp/nuxtjp-ui/blob/main/docs/conformance/status.md)
record coverage and compatibility gaps; full DADS compatibility is not claimed.

Nuxt UI 4.11.3とNuxt Icon 2.5.1へpinを更新し、appと共有するpeerとして宣言します。
The pins are updated to Nuxt UI 4.11.3 and Nuxt Icon 2.5.1 and declared as host peers for module resolution.

Projection refresh permits one callback at a time and skips ticks while pending or hidden. Its returned readonly `error` ref exposes synchronous and Promise failures; `pending` reports active work. `stop()` and unmount clear scheduling and ignore later outcomes in these refs. The callback owns cancellation and any writes to application state.
