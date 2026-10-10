# 一次情報ガバナンス

## 原則

`upstream/sources.lock.json`はNuxt Layer、Nuxt UI dashboard、DADS、ダッシュボードガイドを独立した版軸で追跡します。根拠は公式URLに限定します。

DADS foundationの実装証跡は`@nuxtjp/ui`へ委譲しますが、このLayerが使用するlayout、アクセシビリティ、情報階層の根拠は本リポジトリにも保持します。

## 更新手順

1. `pnpm upstream:check`でreview済みmarkerを照合する。
2. 差分または取得不能を`review-required`として扱う。
3. 一次資料、license、Layerへの影響を人が確認する。
4. 要件、実装、test、移行説明を更新する。
5. review後にだけlockの期待値と確認日を変更する。
6. 手動証跡まで揃った要件だけ`verified`にする。

上流checkはHTTPSと公式hostだけを許可し、redirect、timeout、response sizeを制限します。lock、package、実装、対応statusを書き換えません。

## 状態の意味

| 状態 | 意味 |
|---|---|
| `planned` | 適用するが実装または証跡が未完了 |
| `implemented` | artifactとtestが存在 |
| `verified` | 要件固有の手動証跡をreview済み |
| `exception` | riskと代替策を承認済み |
| `not-applicable` | 適用外の根拠をreview済み |

自動test成功だけで`verified`へ変更しません。
