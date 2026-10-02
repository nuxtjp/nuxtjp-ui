# @nuxtjp/ui

日本語サービスのUIを、共通の部品・テーマ・言語設定で揃えられます。

## 利用前の確認

実装済みの範囲、必要な依存関係、検証コマンドを以下の英語説明に併記しています。操作・配備・公開は、それぞれの権限と設定を確認してから実施してください。

## 導入・使い方

以下は現行インターフェースの利用例です。ローカル成果物の参照がある場合は、必要な版の成果物を先に準備してください。パッケージの公開配布は今回の作業では行いません。

## パッケージ境界

```text
@nuxt/ui
  └─ @nuxtjp/ui                 theme・汎用部品・locale
       └─ @nuxtjp/management-layout  管理画面layout・navigation shell
            └─ consumer             route・API・認証・業務状態
```

このmoduleは次を所有します。

- `@nuxt/ui`の互換範囲、DADS Tailwind theme、semantic colors、日本語font stack
- consumer依存にしない同梱Lucide collectionと、外部font取得を行わないNuxt UI設定
- keyboard focus、reduced motion、skip linkの基礎規則
- 汎用の見出し、読取状態、指標、状態ラベル、コピー、プロセス表示
- localeと可視ページだけを更新する汎用composable
- 一次情報、27要件、DADS 49コンポーネントの採否と証跡

layout、route、API、認証、権限、秘密情報、製品固有文言は所有しません。管理画面の構造は
別Layerの`@nuxtjp/management-layout`、業務固有の手順定義は利用アプリが担当します。

## 導入

通常のpackage配布後は、公式Nuxt moduleと同じ形で導入します。

```sh
pnpm add @nuxtjp/ui
```

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjp/ui'],
  nuxtJpUi: { locale: 'ja' }
})
```

アプリのrootで`NuxtJpApp`を一度使用します。管理Layerを使う場合はLayerが担当します。
Toastの時間進捗はOS時計の補正で100%を超える表示値を生じないよう既定で非表示です。
必要な製品だけ`toaster-progress`を明示的に有効化できます。

```vue
<template><NuxtJpApp><NuxtPage /></NuxtJpApp></template>
```

### ローカル成果物

consumerから本リポジトリのsource pathを直接参照しません。Wonderland rootの
`.artifacts/npm/`で固定版tarballを集約し、各consumerの`vendor/`へ同じ成果物を配備します。
consumerは自身のrepository内だけで解決できる相対`file:` packageを登録します。

```sh
# Wonderland rootで実行
./bin/nuxtjp-ui-package

# consumer repositoryで確認される依存定義
pnpm add "@nuxtjp/ui@file:./vendor/nuxtjp-ui-0.1.0.tgz"
```

lockfileを意図的に更新する場合に限り`./bin/nuxtjp-ui-package --refresh-locks`を使用します。
`.artifacts/npm/`と各`vendor/*.tgz`は生成物としてGit管理対象外です。
`playground`の`../src/module`参照は、このリポジトリ内の開発fixtureにだけ許可します。

## 設定

| option | type | default | purpose |
|---|---|---|---|
| `nuxtJpUi.locale` | `'ja' \| 'en'` | `'ja'` | Nuxt UI localeと`html[lang]`の初期値 |

利用側の`app.config.ts`にある`nuxtJpUi.locale`と`ui.colors`はmodule既定値より優先されます。
Nuxt UIの自動font providerはmodule境界で無効化します。Lucideは`@nuxtjp/ui`がNuxt Iconの
`customCollections`へ登録するため、consumerが`@iconify-json/lucide`を直接追加する必要はありません。

## 公開API

| component / import | purpose |
|---|---|
| `NuxtJpApp` | `UApp`、locale、文書言語の境界 |
| `NuxtJpPageHeader` | ページの主見出し、目的、eyebrow |
| `NuxtJpReadState` | loading、error、empty、readyの明示 |
| `NuxtJpMetricGrid` | 意味を保つ`dl`形式の指標群 |
| `NuxtJpProcessStepper` | 業務非依存の手順、状態、前後移動shell |
| `NuxtJpStatusBadge` | 色だけに依存しない短い状態ラベル |
| `NuxtJpCopyField` | Clipboard拒否時の手動コピーfallback |
| `NuxtJpSkipLink` | キーボード利用者向け本文リンク |
| `useNuxtJpLocale` | 現在の`ja`／`en`を参照 |
| `useNuxtJpProjectionRefresh` | 可視ページだけを定期更新 |
| `@nuxtjp/ui/core` | framework非依存の型と純粋関数 |

詳細は[公開API](docs/api.md)を参照してください。

## 一次情報と対応状況

- [DADS v2.16.0](https://design.digital.go.jp/dads/)
- [DADSスタイルガイド方針](https://design.digital.go.jp/dads/guidance/style-guides/)
- [Nuxt module author guide](https://nuxt.com/docs/4.x/guide/modules)
- [Nuxt UI installation](https://ui.nuxt.com/docs/getting-started/installation/nuxt)
- 参照版と検知条件: [`upstream/sources.lock.json`](upstream/sources.lock.json)
- 要件とカバレッジ: [`compliance/`](compliance/)
- release gate: [`docs/conformance/status.md`](docs/conformance/status.md)
- 更新手順: [`docs/governance/upstream-policy.md`](docs/governance/upstream-policy.md)

DADS文書はv2.16.0ですが、公式tokenとTailwind pluginの明示的な互換表はv2.14.0まで
です。この差分を`compatibility-lag`として追跡し、完全互換を主張しません。

## 開発と検証

```sh
pnpm install --frozen-lockfile
pnpm compliance:verify
pnpm test
pnpm typecheck
pnpm build
pnpm upstream:check
```

`upstream:check`は一次情報の変更を検知するだけで、source、依存関係、適合状態を
自動変更しません。開発、テスト、配布手順は[開発ガイド](docs/development.md)にあります。

ソースはMIT Licenseです。外部資産は[`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)
に記載した各権利者の条件に従います。

## English

Add consistent Japanese-first UI components, theme tokens and locale behavior to a Nuxt application.

## What you can do

- Reuse common status, navigation-support and display components.
- Review traced adoption of Japan’s public design-system guidance.

## Current scope

This is an independent derivative, not an official or certified Nuxt or Digital Agency implementation. Accessibility conformance still requires application-level evidence.

Package distribution is not activated by this documentation. Use the checked-in source and the declared dependency versions; published availability must be verified separately.

## Getting started

Use `pnpm@10.29.3` and the Node.js version declared in `engines` in `package.json`. Run from this repository:

```sh
pnpm install --frozen-lockfile
pnpm compliance:verify
pnpm typecheck
pnpm test
pnpm build:module
```

## Documentation and source

[Usage guide](docs/getting-started.md)

[Detailed documentation](docs) · [Implementation and public interfaces](src) · [Verification cases](test) · [Contributing](CONTRIBUTING.md) · [Security reporting](SECURITY.md) · [License](LICENSE) · [Attribution notices](NOTICE) · [Third-party notices](THIRD_PARTY_NOTICES.md)
