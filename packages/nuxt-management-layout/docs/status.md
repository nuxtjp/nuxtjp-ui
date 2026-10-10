# 対応状況

確認日: 2026-08-05

## 実装済み

- npm packageとして継承できるNuxt 4 Layer
- `@nuxtjp/ui` moduleへの一方向依存
- skip link、main landmark、主navigation、breadcrumb
- overviewからdetailへ進むroute、navigation、breadcrumb解決
- transport、lifecycle、health、actionabilityを分離したstate model
- data source、観測時点、stale、未取得の共通表示
- consumer所有のbrand、route、navigationに対するfail-closed検証
- 一次情報と要件証跡のschema検証、差分検知、読取専用CI

## 公開前ゲート

- consumerごとのJIS X 8341-3:2016 AA／WCAG 2.2 A・AA手動確認
- keyboard、読み上げ、200%／400%拡大、Windows high contrast確認
- 実データ量での情報密度、表、graph、topology代替表の確認
- DADSおよびNuxt一次情報の更新差分レビュー
- registryでの`@nuxtjp/ui`固定版公開とprovenance確認

この一覧はDADS全体への適合認定ではありません。基礎styleの対応状況は`@nuxtjp/ui`が管理し、本リポジトリは管理画面構造に限定して主張します。`implemented`は成果物とtestの存在を示し、page単位の手動適合を示す`verified`ではありません。
