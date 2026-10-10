# @nuxtjp/ui

[English](README.md)

日本語サービスごとにUIのテーマ、言語、読取状態が異なると、利用と保守が難しくなります。このNuxt moduleはNuxt UIを基盤に、共通の部品、DADS参照テーマ、`ja`/`en`のlocaleを提供します。route、API、認証、権限、業務状態は利用アプリが担当します。

## 導入と使い方

`0.1.0`はnpmで公開済みです。Nuxt `^4.5.2`、Vue `^3.5.40`、Node.js 22.19以降または24.11以降を使用してください。

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

`@nuxtjp/ui`を登録し、アプリのrootで`NuxtJpApp`を一度使います。`nuxtJpUi.locale`は`ja`または`en`に設定できます。アプリの`app.config.ts`のlocaleと`ui.colors`を優先します。
Lucide collectionは同梱し、Nuxt UIの外部font取得は無効にします。Toastの時間進捗は既定で非表示です。必要なアプリだけ`toaster-progress`を有効にできます。

## 公開インターフェースと制約

moduleは共通UIを揃え、利用アプリは業務固有の動作を担当します。入口は`@nuxtjp/ui`、framework非依存の型・関数は`@nuxtjp/ui/core`です。サービスや認証情報のAPIは公開しません。
実装済みのcomponent、composable、純粋関数は[公開API](https://github.com/nuxtjp/nuxtjp-ui/blob/main/docs/api.md)を参照してください。
Nuxt UI `4.11.3`とNuxt Icon `2.5.1`へpinを更新し、module解決のためにappと共有するpeerとして宣言します。

Projection refreshはcallbackを同時に1つだけ実行し、処理中または非表示の間はtickを飛ばします。返されるreadonlyの`error` refに同期例外とPromise失敗、`pending`に処理中の状態を公開します。`stop()`とunmountはscheduleを解除し、後から返る結果をこれらのrefへ反映しません。取消とアプリ状態への書込はcallback側の責務です。

独立実装であり、Nuxtやデジタル庁の公式・認証済み製品ではありません。アプリ全体のaccessibility適合やDADS完全互換を保証しません。

## 開発とarchive検証

```sh
pnpm install --frozen-lockfile
pnpm compliance:verify
pnpm test
pnpm typecheck
pnpm build
pnpm pack --pack-destination ./artifacts
```

`prepack`は既存のcompliance/test/type/build検査を繰り返します。ローカルarchiveはpackagingの検証であり、registry配布の確認とは別です。
[開発ガイド](https://github.com/nuxtjp/nuxtjp-ui/blob/main/docs/development.md)にarchiveとconsumerの検査を説明しています。upstream検出は依存やソースを更新しません。

## ライセンスと帰属

package manifestと[LICENSE](LICENSE)はApache-2.0を指定します。[LICENSE-PREVIOUS](LICENSE-PREVIOUS)は以前のMIT表示を保持し、以前の許諾と第三者条件は[NOTICE](NOTICE)と[第三者表示](THIRD_PARTY_NOTICES.md)に記録します。このREADME整理はライセンスファイルや許諾を変更しません。
DADSのガイド、ソース、素材の条件は別に管理します。ロゴや公式markは含みません。[参照版](https://github.com/nuxtjp/nuxtjp-ui/blob/main/upstream/sources.lock.json)と[適合状況](https://github.com/nuxtjp/nuxtjp-ui/blob/main/docs/conformance/status.md)に対象範囲と互換性の不足を記録しています。アプリ全体のaccessibilityを示す検証は別途必要です。
