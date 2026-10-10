import type {
  ControlDecisionStatus,
  ControlReceiptStatus
} from './common'

export const NETWORK_CONTROLS_SCHEMA = 'crowsi://network/control-receipts/v1' as const

export type NetworkControlAction =
  | 'quarantine-interface'
  | 'restrict-egress'
  | 'restore-egress'
  | 'enter-maintenance'
  | 'exit-maintenance'

export interface NetworkControlDecision {
  id: string
  target_id: string
  action: NetworkControlAction
  status: ControlDecisionStatus
  decided_at: string
  expires_at: string
  reason_code: string
  requested_by: string
  decided_by: string
  matched_rule_id: string | null
}

export interface NetworkControlReceipt {
  id: string
  decision_id: string
  target_id: string
  status: ControlReceiptStatus
  recorded_at: string
  result_code: string
  changed_state: false
}

export interface NetworkControlsDocument {
  schema: typeof NETWORK_CONTROLS_SCHEMA
  generated_at: string
  external_actions: false
  decision_count: number
  receipt_count: number
  decisions: NetworkControlDecision[]
  receipts: NetworkControlReceipt[]
}
