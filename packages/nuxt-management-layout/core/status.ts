import type {
  ManagementDimensions,
  ManagementDisplayState,
  ManagementStatus,
  ManagementSummaryItem,
  ManagementTransportState
} from './status-types'

const metadata = {
  ja: {
    loading: ['確認中', 'neutral', '最新状態を確認しています。'],
    ready: ['正常', 'success', '必要な状態を確認できました。'],
    degraded: ['要確認', 'warning', '一部の機能または証拠が不足しています。'],
    blocked: ['停止中', 'error', '前提を満たすまで操作を行えません。'],
    unconfigured: ['未設定', 'neutral', '初期設定が完了していません。'],
    pending: ['進行中', 'info', '処理または確認の完了を待っています。'],
    error: ['取得エラー', 'error', '現在状態を確認できません。'],
    unknown: ['判定不能', 'warning', '信頼できる根拠が不足しています。']
  },
  en: {
    loading: ['Checking', 'neutral', 'Checking the current state.'],
    ready: ['Ready', 'success', 'The required state is available.'],
    degraded: ['Attention', 'warning', 'Some capabilities or evidence are missing.'],
    blocked: ['Blocked', 'error', 'Actions remain blocked until prerequisites are met.'],
    unconfigured: ['Not configured', 'neutral', 'Initial configuration is incomplete.'],
    pending: ['In progress', 'info', 'Waiting for processing or verification.'],
    error: ['Unavailable', 'error', 'The current state could not be retrieved.'],
    unknown: ['Unknown', 'warning', 'There is not enough trusted evidence.']
  }
} as const

const attentionRank: Record<ManagementDisplayState, number> = {
  error: 0, blocked: 1, degraded: 2, unknown: 3,
  pending: 4, unconfigured: 5, loading: 6, ready: 7
}

export function managementDisplayState(value: ManagementDimensions): ManagementDisplayState {
  if (value.transport === 'error') return 'error'
  if (value.transport === 'loading') return 'loading'
  if (value.health === 'error') return 'error'
  if (value.health === 'blocked') return 'blocked'
  if (value.lifecycle === 'pending' || value.action === 'busy') return 'pending'
  if (value.lifecycle === 'unconfigured') return 'unconfigured'
  if (value.health === 'degraded') return 'degraded'
  if (value.health === 'unknown') return 'unknown'
  return 'ready'
}

export function managementStatus(
  dimensions: ManagementDimensions,
  options: Partial<Pick<ManagementStatus,
    'summary' | 'reasonCodes' | 'observedAt' | 'stale'>> = {},
  locale: 'ja' | 'en' = 'ja'
): ManagementStatus {
  const state = managementDisplayState(dimensions)
  const [label, color, summary] = metadata[locale][state]
  return {
    state, label, color, dimensions,
    summary: options.summary ?? summary,
    reasonCodes: options.reasonCodes ?? [],
    observedAt: options.observedAt ?? null,
    stale: options.stale ?? false
  }
}

export function managementTransport(
  status: string, data: unknown, error: unknown
): ManagementTransportState {
  if (error || status === 'error') return 'error'
  if (status === 'idle' || status === 'pending') return 'loading'
  return data === undefined || data === null ? 'error' : 'ready'
}

export function managementAttentionItems(items: ManagementSummaryItem[]) {
  return items.filter(item => !['ready', 'loading'].includes(item.status.state))
    .sort((left, right) => attentionRank[left.status.state] - attentionRank[right.status.state])
}
