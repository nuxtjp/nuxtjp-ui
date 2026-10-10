# @nuxtjp/operations-console

認証情報の準備状態、ネットワーク観測、制御結果を同じ表示ルールで確認できます。

## 利用前の確認

実装済みの範囲、必要な依存関係、検証コマンドを以下の英語説明に併記しています。操作・配備・公開は、それぞれの権限と設定を確認してから実施してください。

## 導入・使い方

以下は現行インターフェースの利用例です。ローカル成果物の参照がある場合は、必要な版の成果物を先に準備してください。パッケージの公開配布は今回の作業では行いません。

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

## English

Show credential readiness, network observations and control coverage in a consistent operations view.

## What you can do

- Render reviewed readiness and topology documents.
- Use individual panels or the combined console.

## Current scope

The application supplies validated observations. Displaying a control result does not perform a network change.

Package distribution is not activated by this documentation. Use the checked-in source and the declared dependency versions; published availability must be verified separately.

## Getting started

Use `pnpm@10.29.3` and the Node.js version declared in `engines` in `package.json`. Run from this repository:

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
```

## Documentation and source

[Usage guide](docs/getting-started.md)

[Schemas](schemas) · [Detailed documentation](docs) · [Implementation and public interfaces](src) · [Verification cases](test) · [Contributing](CONTRIBUTING.md) · [Security reporting](SECURITY.md) · [License](LICENSE) · [Attribution notices](NOTICE) · [Third-party notices](THIRD_PARTY_NOTICES.md)
