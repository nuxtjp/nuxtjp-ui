# @nuxtjp/operations-console

[English](docs/en/README.md)

認証情報の準備状態、ネットワーク観測、ネットワーク制御の評価記録と
安全なトポロジー投影を
表示する小さな Nuxt 4 モジュールです。Crowsi のVersion付きContractを
認識しますが、CrowsiのSource pathやRuntimeには依存しません。

## 導入と組み合わせ

Version固定したArtifactを導入します。

```bash
pnpm add ./vendor/nuxtjp-operations-console-0.2.1.tgz
```

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjp/operations-console']
})
```

統合Consoleのほか、製品が必要とする投影だけを単独で表示できます。

```vue
<NuxtJpOperationsConsole
  :credential-readiness="credentialDocument"
  :network-observations="observationDocument"
  :network-controls="controlDocument"
  :control-coverage="coverageDocument"
/>
<NuxtJpCredentialReadinessPanel :document="credentialDocument" />
<NuxtJpNetworkObservationsPanel :document="observationDocument" />
<NuxtJpNetworkControlsPanel :document="controlDocument" />
<NuxtJpControlCoveragePanel :document="coverageDocument" />
<NuxtJpNetworkTopologyPanel :document="topologyDocument" />
```

表示言語は日本語が既定です。英語は `locale="en"` を指定します。

## Contract

- `crowsi://credentials/status/v1`
- `crowsi://network/observations/v1`
- `crowsi://network/control-receipts/v1`
- `crowsi://network/control-coverage-snapshot/v2`
- `nuxtjp://operations/network-topology/v1`

JSON Schemaは5つの
`@nuxtjp/operations-console/schema/*` pathから、型、Guard、Label、
Validation、集計関数は `@nuxtjp/operations-console/core` から公開します。

Control coverageは任意入力であり、既存Summaryへ安全状態を混在させず専用Panel
で表示します。投影が5分より古い場合、controlled件数を0、各assetをunknown、
即時隔離を未検証へ降格します。Panelはfindingを表示するだけで変更操作を
提供しません。

Runtime Guardは件数、ID重複、配列上限、UTCミリ秒形式、および各決定と
変更を伴わないReceiptの1対1対応を検証します。検証済みDataは呼出元から
切り離してfreezeし、5分より古い投影を全体の `ready` 判定に使いません。

## セキュリティ

Credential文書にはSecret専用fieldがありません。ただし、Producerが
文字列fieldへ機密値を誤投入していないことをSchemaだけで証明することは
できません。Producer認証、metadata-only生成、転送byte上限が必須です。
このModuleはHostを観測せず、制御Buttonも提供しません。トポロジーの線は
観測関係だけを示し、通信到達性を保証しません。実観測、宣言値、未接続は
異なる表示で区別します。
[SECURITY.md](SECURITY.md)も確認してください。

## 検証用Playground

```bash
pnpm install --offline --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm exec nuxt dev playground --host 127.0.0.1
```

確認後はPlaygroundを停止してください。ConsumerはCrowsiのSource treeを
参照せず、Version固定したArtifactを利用します。NuxtJPは独立した日本の
Nuxt Communityであり、Upstream公式翻訳を表明するものではありません。
