import type {
  ControlCoverageLabels,
  OperationsLocale
} from './types'

const ja: ControlCoverageLabels = {
  heading: 'ネットワーク制御カバレッジ',
  description: '隔離に必要な権限、観測、Enforcer、管理経路、訓練を確認します。',
  invalid: '制御カバレッジ投影を検証できないため表示を停止しました。',
  stale: '投影が古いため、制御可能とは判定しません。',
  assets: '管理対象',
  controlled: '制御可能性を確認済み',
  gaps: '制御ギャップ',
  generatedAt: '投影生成日時',
  status: '状態',
  asset: '対象',
  isolation: '隔離経路の準備',
  findings: '確認事項',
  verified: '準備証跡あり',
  notVerified: '未検証',
  none: '該当なし'
}

const en: ControlCoverageLabels = {
  heading: 'Network control coverage',
  description: 'Authority, sensing, enforcement, lifeline, and drill evidence.',
  invalid: 'Rendering stopped because the control coverage snapshot is invalid.',
  stale: 'This projection is stale and is not treated as controlled.',
  assets: 'Managed assets',
  controlled: 'Control capability verified',
  gaps: 'Control gaps',
  generatedAt: 'Projection generated',
  status: 'Status',
  asset: 'Asset',
  isolation: 'Isolation path readiness',
  findings: 'Findings',
  verified: 'Readiness evidence present',
  notVerified: 'Not verified',
  none: 'None'
}

const findings: Record<string, [string, string]> = {
  'management-authority-missing': ['管理権限がありません', 'Management authority missing'],
  'sensor-not-connected': ['センサーが接続されていません', 'Sensor not connected'],
  'observation-stale': ['観測が期限切れです', 'Observation stale'],
  'enforcer-not-ready': ['Enforcerが準備未完了です', 'Enforcer not ready'],
  'required-control-action-missing': ['必須制御操作が不足しています', 'Required action missing'],
  'management-lifeline-unverified': ['管理用lifelineが未検証です', 'Management lifeline unverified'],
  'isolation-drill-stale': ['隔離訓練が期限切れです', 'Isolation drill stale'],
  'coverage-snapshot-stale': ['カバレッジ投影が期限切れです', 'Coverage snapshot stale']
}

export function resolveControlCoverageLabels(
  locale: OperationsLocale,
  overrides: Partial<ControlCoverageLabels> = {}
): ControlCoverageLabels {
  return { ...(locale === 'ja' ? ja : en), ...overrides }
}

export function controlCoverageFindingLabel(
  code: string,
  locale: OperationsLocale
): string {
  const label = findings[code]
  return label?.[locale === 'ja' ? 0 : 1] ?? code
}
