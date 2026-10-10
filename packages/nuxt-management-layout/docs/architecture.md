# アーキテクチャ

## 依存方向

| 境界 | 所有するもの | 所有しないもの |
|---|---|---|
| `@nuxtjp/ui` | Nuxt UI導入、token、locale、汎用primitive | layout、業務route、業務state |
| management Layer | shell、navigation解決、4軸state表示 | API、認可、秘密、製品route |
| consumer | 業務page、projection、permission、文言 | themeやshellの複製 |

依存は`@nuxtjp/ui` → management Layer → consumerの一方向です。基盤packageは上位packageやconsumerをimportしません。このLayerもNuxt UIやDADS themeを直接導入せず、`@nuxtjp/ui` moduleの公開契約だけを使用します。

## Nuxt Layer

[Nuxt Layers](https://nuxt.com/docs/4.x/getting-started/layers)の`extends`によって、consumerがpackageを継承します。package entryは`nuxt.config.ts`であり、Layer所有のCSSは`import.meta.url`を基準に解決します。実行環境の作業ディレクトリやWonderland固有パスには依存しません。

consumerの同名ファイルはLayerより優先されます。consumerがdefault layoutを置き換えた場合、その差分と検証責任はconsumerへ移ります。

### 表示perspective

consumerはnavigation groupを重複のない複数のperspectiveへ分割できます。Layerは
現在routeから最も近い所属groupを決定し、そのperspectiveのmenuだけを表示します。
perspectiveは表示上の情報設計であり、認可、データ所有、runtime分離を意味しません。

## データ境界

Layerが受け取るのは宣言的なroute metadataと表示用status modelだけです。外部通信を行いません。永続化するのはNuxt UIが管理するsidebar幅だけで、keyはconsumerが指定できます。

認証、認可、秘密情報、個人情報、監査、provider固有errorはconsumerに残します。reason codeは表示できますが、秘密値を含めないようconsumerが無害化します。

## package artifact

開発時もconsumerは別リポジトリのsourceを直接参照しません。Wonderland root `.artifacts/npm/`は一時stageであり、consumerの依存先は自身の`vendor/*.tgz`です。公開後は固定版registry packageへ置き換えます。
