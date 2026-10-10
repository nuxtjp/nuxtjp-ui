# セキュリティ境界

[English](docs/en/SECURITY.md)

`@nuxtjp/operations-console` は読取専用の表示Packageです。Network探索、
Credential取得、認可、Policy実行、Control plane機能を持ちません。

受理するCrowsi Contractは次の4つだけです。

- `crowsi://credentials/status/v1`
- `crowsi://network/observations/v1`
- `crowsi://network/control-receipts/v1`
- `crowsi://network/control-coverage-snapshot/v2`

未知fieldを拒否し、全Documentに `external_actions: false`、
Credential文書に `contains_secret_values: false` を要求します。
Secret専用fieldがないことはData最小化であり、内容分類の証明ではありません。
Browser境界より前でProducerを認証し、metadata-only生成を強制してください。

Guard失敗は信頼境界の失敗です。部分表示、暗黙変換、拒否DataのLoggingを
行わないでください。

- Secret値はCredential Broker内に保ちます。
- 各dry-run Receiptを元の決定と対象へ結び付けます。
- 転送byte上限を設けます。GuardはCredentialとObservationを各1,024件、
  Control DecisionとReceiptを各256件、Findingを64件に制限します。
- `allowed-dry-run` を変更実行済みと解釈しません。
- 5分より古い投影を `ready` 判断に使いません。
- 古いControl coverageを `controlled` や隔離準備済みとして表示しません。
- Coverage findingは表示専用で、隔離・復旧ButtonやPolicy実行を追加しません。
- 生の投影をAnalytics、Browser永続領域、Error logへ保存しません。
- Source path依存ではなくVersion固定Artifactを利用します。

Sampleは合成IDだけを含み、Credentialや稼働Endpointを含みません。
脆弱性は非公開経路で報告し、実Credentialを添付しないでください。
