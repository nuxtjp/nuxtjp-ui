# @nuxtjp/management-layout

NuxtJP UIの上に、管理画面のシェル、ナビゲーション、パンくず、状態サマリーを構成するNuxt 4 Layerです。製品固有のページ、API、権限判断、データ、業務文言は保持しません。

日本語を既定とし、英語の概要は [docs/en/README.md](docs/en/README.md) に用意しています。

本リポジトリはNuxt、Nuxt UI、デジタル庁の公式または認定実装ではありません。[DADS v2.16.0](https://design.digital.go.jp/dads/)を基礎実装する責務は`@nuxtjp/ui`へ委譲し、このLayerは管理画面の構造だけを対象とします。

## 責務境界

```text
@nuxt/ui
  └─ @nuxtjp/ui                    theme・汎用UI・locale
       └─ @nuxtjp/management-layout shell・navigation・状態表現
            └─ consumer             業務ページ・API・権限・状態変換
```

依存方向は一方向です。このLayerは`@nuxtjp/ui`をmoduleとして登録しますが、Nuxt UI、DADS theme、外部サービスへ直接依存しません。consumerもLayerのソースパスを参照しません。

詳細は [アーキテクチャ](docs/architecture.md) と [スタイルガイド](docs/style-guide.md) を参照してください。

## 導入

[Nuxt Layers](https://nuxt.com/docs/4.x/getting-started/layers)の方針に沿い、公開後は固定版npm packageをインストールしてpackage名で継承します。

```sh
pnpm add @nuxtjp/ui@0.1.0 @nuxtjp/management-layout@0.2.0
```

```ts
export default defineNuxtConfig({
  extends: ['@nuxtjp/management-layout']
})
```

consumerは`app.config.ts`へ表示用の構成だけを宣言します。

```ts
export default defineAppConfig({
  nuxtJpUi: { locale: 'ja' },
  nuxtJpManagementLayout: {
    brand: { name: 'Example', mark: 'E', home: '/' },
    routes: [
      { id: 'profile', label: '基本情報', title: '基本情報', path: '/profile' },
      { id: 'work', label: '作業', title: '作業', path: '/' }
    ],
    navigation: [
      { id: 'foundation', label: '基盤', routeIds: ['profile'] },
      { id: 'work', label: '作業', routeIds: ['work'] }
    ],
    perspectives: [
      { id: 'foundation', label: '基本情報・基盤', description: '基盤を管理',
        home: '/profile', navigationGroupIds: ['foundation'] },
      { id: 'work', label: '作業・予実', description: '作業を確認',
        home: '/', navigationGroupIds: ['work'] }
    ]
  }
})
```

`perspectives`は同じ管理製品内の情報設計を切り替えます。各navigation groupは
ちょうど一つのperspectiveに属し、詳細ページは最も近い親routeの所属を継承します。
`perspectivePlacement: 'footer'`を指定すると、切替を左下の管理セッションメニューへ
配置できます。現在レイヤー、切替先、セッション情報を一つの操作面にまとめます。
これは権限境界や別アプリケーションを表すものではありません。

## ローカルpackage artifact

公開前の検証では、Wonderland rootで次を実行します。

```sh
./bin/nuxtjp-ui-package --refresh-locks
```

このコマンドは一時stageをWonderland rootの`.artifacts/npm/`に作り、固定版tarballを各consumerの`vendor/*.tgz`へ配置してlockfileを更新します。consumerは`.artifacts/npm/`や別リポジトリのソースを直接参照せず、自身の`vendor/`に配置された成果物だけを使用します。

このリポジトリのローカル開発依存は`vendor/nuxtjp-ui-0.1.0.tgz`です。tarballは生成物のためGit管理しません。

## 検証

```sh
pnpm install --frozen-lockfile
pnpm compliance:verify
pnpm test
pnpm typecheck
pnpm build
```

一次情報の変更確認は、実装を更新しない次のコマンドで行います。

```sh
pnpm upstream:check
```

差分または取得不能は`review-required`となります。lock、依存関係、実装、対応状態を自動更新しません。

## 証跡

- [一次情報lock](upstream/sources.lock.json)
- [要件カタログ](compliance/requirements.json)
- [対応状況](docs/status.md)
- [一次情報ガバナンス](docs/governance.md)
- [第三者通知](THIRD_PARTY_NOTICES.md)
- [セキュリティ方針](SECURITY.md)

JIS X 8341-3:2016 AA、WCAG 2.2 A/AA、読み上げ、拡大、ハイコントラストはconsumerページ単位の公開ゲートです。このLayer単体の自動試験は、その適合を保証しません。
