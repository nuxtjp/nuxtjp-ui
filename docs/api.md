# 公開API

## Component

すべて`NuxtJp` prefixでauto-importされます。画面構造や業務データを内包しません。

### `NuxtJpApp`

Nuxt UIの`UApp`、`html[lang]`、日本語／英語localeを接続します。アプリケーションの
rootで一度だけ使用してください。

### `NuxtJpPageHeader`

`title`は必須、`eyebrow`と`description`は任意です。ページ内の主見出しとして使い、
カードやダイアログ内の小見出しには使いません。

### `NuxtJpReadState`

`transport`へ`loading | ready | error`を渡します。`empty`は通信成功後に対象がない状態
だけに使用し、未取得や取得失敗と混同しません。`retry` eventは再取得の意思だけを通知します。

### `NuxtJpMetricGrid`

`items: { label, value }[]`を`dl`として表示します。値の取得時点、単位、出典はconsumerが
labelまたは周辺コンテンツで説明します。

### `NuxtJpProcessStepper`

`v-model`は現在のstep ID、`items`は次の型です。

```ts
interface NuxtJpUiProcessStep {
  value: string
  slot?: string
  title: string
  description?: string
  state?: 'upcoming' | 'current' | 'complete' | 'error'
  disabled?: boolean
}
```

`slot`または`value`と同名のslotへ業務コンテンツを渡します。`state`省略時は現在位置から
`upcoming | current | complete`を導出し、業務側は`error`などを明示できます。componentは
表示と前後移動だけを担い、
route同期、認可、保存、実行、状態判定はconsumerが担います。

```vue
<NuxtJpProcessStepper v-model="active" :items="steps">
  <template #prepare><SetupPrerequisites /></template>
  <template #connect><ConnectionForm /></template>
</NuxtJpProcessStepper>
```

### `NuxtJpStatusBadge` / `NuxtJpCopyField` / `NuxtJpSkipLink`

状態は必ず`label`で示します。コピーは失敗時に手動選択欄へfallbackします。skip linkは
対象のmain landmark IDと一致させます。

## Composable

- `useNuxtJpLocale()`はreadonlyな計算結果として`ja | en`を返します。
- `useNuxtJpProjectionRefresh(refresh, intervalMs?)`はdocumentが可視の間だけ定期実行します。

## Core export

`@nuxtjp/ui/core`はUI runtimeに依存しない型、clipboard fallback、read-state変換を公開します。
このsubpath以外の`dist/runtime`内部pathは公開APIではありません。
