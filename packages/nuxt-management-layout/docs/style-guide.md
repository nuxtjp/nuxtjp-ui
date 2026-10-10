# 管理画面レイアウト・スタイルガイド

## 基準

このLayerは、[DADS v2.16.0](https://design.digital.go.jp/dads/)、[DADSスタイルガイド](https://design.digital.go.jp/dads/guidance/style-guides/)、[アクセシビリティ指針](https://design.digital.go.jp/dads/guidance/accessibility/)、[ダッシュボードガイド](https://www.digital.go.jp/resources/dashboard-guidebook)を参照します。

DADSのtokenとprimitiveは`@nuxtjp/ui`が所有します。このLayerは管理画面固有の配置と情報階層だけを定め、DADS公式または完全準拠を名乗りません。

## 画面構造

1. chromeより前に本文へのskip linkを置く。
2. sidebarは主navigationとbrand識別だけを担う。
3. navbarは現在pageと全体環境を示す。
4. breadcrumbは現在routeの親子関係から生成する。
5. `main`には一つのpage主見出しを置く。
6. overview、絞り込んだ一覧、detailの順で段階的に開示する。

consumerは業務上必要なmenu groupとrouteだけを宣言します。Layer側に製品名やprovider名を追加しません。

Rolldownのplugin timing advisoryはbuild成否や実装warningではなく、Nuxt/Tailwindの重複した
hook計時をwarningとして出すため、このLayerでは無効化します。性能計測はNuxtの
performance reportを正本とし、通常buildをwarning-freeに保ちます。

実行時に変わるmenuは、consumerが検証済みデータを既存groupへ投影する場合だけ許可します。
項目は同一originの既存画面へ向けます。既存groupの直下に加えるか、そのgroupが
宣言済みのrouteを`parentRouteId`として、その下へ最大2階層を追加できます。
静的な親を含む表示は最大3階層です。外部データがroute、component、
HTML、CSSを直接指定することは禁止します。labelとtitleはwire上の識別子を省略せず扱える
512文字を上限とし、表示上の省略は描画側だけで行います。

## 状態

通信、lifecycle、health、操作可能性を一つのstatusへ潰しません。状態は短い文字label、要約、必要に応じたreason codeで示し、色だけに依存しません。

各summaryではdata source、観測時点、stale状態を示します。値がゼロの場合と未取得を区別します。操作できないcontrolを残す代わりに、無効理由と前提条件への導線を示します。

## Layoutとtarget

sidebar、header、contentは一貫したgridに載せます。本文は既定で可読幅に制限し、data tableやtopologyが必要なpageだけ`full`を選びます。

navigation chromeのlinkとbuttonは44px以上を確保します。focus表示と基礎colorは`@nuxtjp/ui`の契約を継承し、consumer CSSで消しません。

## アクセシビリティ

Layerの自動testだけではpage適合を保証しません。consumerは公開前に次を確認します。

- 見出し、label、landmark、accessible name
- keyboard操作とfocus順序
- 読み上げとdynamic state通知
- text／non-text contrastとtarget重なり
- 200%／400%拡大とreflow
- chartやtopologyと同等のtableまたは文章
- JIS X 8341-3:2016 AAおよびWCAG 2.2 A/AA

現在の証跡は [対応状況](status.md) を参照してください。
