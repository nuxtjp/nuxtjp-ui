import type { ManagementColor } from './config'

export type ManagementTransportState = 'loading' | 'ready' | 'error'
export type ManagementLifecycleState = 'unconfigured' | 'pending' | 'configured'
export type ManagementHealthState = 'ready' | 'degraded' | 'blocked' | 'unknown' | 'error'
export type ManagementActionState = 'available' | 'blocked' | 'busy' | 'read-only'
export type ManagementDisplayState =
  | 'loading' | 'ready' | 'degraded' | 'blocked'
  | 'unconfigured' | 'pending' | 'error' | 'unknown'

export interface ManagementDimensions {
  transport: ManagementTransportState
  lifecycle: ManagementLifecycleState
  health: ManagementHealthState
  action: ManagementActionState
}

export interface ManagementStatus {
  state: ManagementDisplayState
  label: string
  color: ManagementColor
  summary: string
  reasonCodes: string[]
  observedAt: string | null
  stale: boolean
  dimensions: ManagementDimensions
}

export interface ManagementAction {
  label: string
  kind: 'navigate' | 'retry' | 'native' | 'external' | 'danger'
  to?: string
  disabled?: boolean
  disabledReason?: string
  prerequisiteTo?: string
  prerequisiteLabel?: string
}

export interface ManagementMetric { label: string, value: string | number }

export interface ManagementSummaryItem {
  id: string
  domain: string
  title: string
  description: string
  status: ManagementStatus
  metrics: ManagementMetric[]
  sourceLabel?: string
  detailTo?: string
  primaryAction?: ManagementAction
}
