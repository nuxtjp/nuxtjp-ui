import type {
  OperationsConsoleLabels,
  OperationsLocale
} from './types'

const ja: OperationsConsoleLabels = {
  heading: '運用基盤コンソール',
  description: '認証情報の準備状態、ネットワーク観測、制御評価記録を確認します。',
  invalid: '入力データを検証できないため表示を停止しました。',
  credentials: '認証情報の準備状態',
  networks: 'ネットワーク観測',
  controls: 'ネットワーク制御',
  ready: '正常',
  attention: '要確認',
  status: '状態',
  provider: '提供元',
  purpose: '用途',
  scope: '適用範囲',
  storage: '保管方式',
  checkedAt: '確認日時',
  target: '対象',
  protocol: 'プロトコル',
  latency: '遅延',
  observedAt: '観測日時',
  action: '操作',
  decision: '決定',
  result: '評価結果',
  recordedAt: '記録日時',
  stale: '古い投影',
  dryRunNotice: 'すべて評価専用であり、ネットワーク状態は変更していません。',
  none: '該当なし'
}

const en: OperationsConsoleLabels = {
  heading: 'Operations foundation console',
  description: 'Credential readiness, network observations, and control evaluation records.',
  invalid: 'Rendering stopped because the input documents failed validation.',
  credentials: 'Credential readiness',
  networks: 'Network observations',
  controls: 'Network controls',
  ready: 'Ready',
  attention: 'Attention',
  status: 'Status',
  provider: 'Provider',
  purpose: 'Purpose',
  scope: 'Scope',
  storage: 'Storage',
  checkedAt: 'Checked',
  target: 'Target',
  protocol: 'Protocol',
  latency: 'Latency',
  observedAt: 'Observed',
  action: 'Action',
  decision: 'Decision',
  result: 'Evaluation',
  recordedAt: 'Recorded',
  stale: 'stale projections',
  dryRunNotice: 'All decisions are evaluations only; no network state was changed.',
  none: 'None'
}

const jaStatuses: Record<string, string> = {
  attention: '要確認',
  ready: '準備完了',
  expired: '期限切れ',
  revoked: '失効',
  unavailable: '利用不可',
  reachable: '到達可能',
  observed: '観測済み',
  degraded: '低下',
  'allowed-dry-run': 'ドライラン評価: 許可（未実行）',
  denied: '拒否',
  recorded: '記録済み',
  controlled: '制御可能性を確認済み',
  partial: '一部不足',
  unknown: '不明',
  unmanaged: '管理権限なし'
}

export function resolveLabels(
  locale: OperationsLocale,
  overrides: Partial<OperationsConsoleLabels> = {}
): OperationsConsoleLabels {
  return { ...(locale === 'ja' ? ja : en), ...overrides }
}

export function statusLabel(value: string, locale: OperationsLocale): string {
  return locale === 'ja' ? (jaStatuses[value] ?? value) : value
}
