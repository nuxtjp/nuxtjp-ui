import {
  NETWORK_CONTROLS_SCHEMA,
  type NetworkControlDecision,
  type NetworkControlReceipt,
  type NetworkControlsDocument
} from '../types'
import {
  hasExactKeys,
  hasUniqueIds,
  isBoundedArray,
  isCount,
  isLetterIdentifier,
  isRecord,
  isTimestamp
} from './primitives'
import { MAX_CONTROL_ITEMS } from './primitives'

const actions = [
  'quarantine-interface',
  'restrict-egress',
  'restore-egress',
  'enter-maintenance',
  'exit-maintenance'
]
const decisionStatuses = ['allowed-dry-run', 'denied']
const decisionKeys = [
  'id', 'target_id', 'action', 'status', 'decided_at',
  'expires_at', 'reason_code', 'requested_by', 'decided_by', 'matched_rule_id'
]
const receiptKeys = [
  'id', 'decision_id', 'target_id', 'status', 'recorded_at',
  'result_code', 'changed_state'
]
const documentKeys = [
  'schema', 'generated_at', 'external_actions', 'decision_count',
  'receipt_count', 'decisions', 'receipts'
]
const MAX_ALLOWANCE_WINDOW_MS = 60 * 60 * 1_000

function isOneOf(value: unknown, choices: readonly string[]): value is string {
  return typeof value === 'string' && choices.includes(value)
}

export function isNetworkControlDecision(value: unknown): value is NetworkControlDecision {
  if (!isRecord(value) || !hasExactKeys(value, decisionKeys)) return false
  const decidedAt = typeof value.decided_at === 'string'
    ? Date.parse(value.decided_at)
    : Number.NaN
  const expiresAt = typeof value.expires_at === 'string'
    ? Date.parse(value.expires_at)
    : Number.NaN
  const isAllowed = value.status === 'allowed-dry-run'
  return isLetterIdentifier(value.id)
    && isLetterIdentifier(value.target_id)
    && isOneOf(value.action, actions)
    && isOneOf(value.status, decisionStatuses)
    && isTimestamp(value.decided_at)
    && isTimestamp(value.expires_at)
    && isLetterIdentifier(value.reason_code)
    && isLetterIdentifier(value.requested_by)
    && isLetterIdentifier(value.decided_by)
    && (value.matched_rule_id === null || isLetterIdentifier(value.matched_rule_id))
    && isAllowed === (value.matched_rule_id !== null)
    && (isAllowed
      ? value.reason_code === 'allowlist-match'
        && expiresAt > decidedAt
        && expiresAt - decidedAt <= MAX_ALLOWANCE_WINDOW_MS
      : value.reason_code !== 'allowlist-match')
}

export function isNetworkControlReceipt(value: unknown): value is NetworkControlReceipt {
  if (!isRecord(value) || !hasExactKeys(value, receiptKeys)) return false
  return isLetterIdentifier(value.id)
    && isLetterIdentifier(value.decision_id)
    && isLetterIdentifier(value.target_id)
    && value.status === 'recorded'
    && isTimestamp(value.recorded_at)
    && isLetterIdentifier(value.result_code)
    && value.changed_state === false
}

export function isNetworkControlsDocument(value: unknown): value is NetworkControlsDocument {
  if (!isRecord(value) || !hasExactKeys(value, documentKeys)) return false
  if (value.schema !== NETWORK_CONTROLS_SCHEMA
    || value.external_actions !== false
    || !isTimestamp(value.generated_at)
    || !isCount(value.decision_count)
    || !isCount(value.receipt_count)
    || !isBoundedArray(value.decisions, MAX_CONTROL_ITEMS)
    || !isBoundedArray(value.receipts, MAX_CONTROL_ITEMS)
    || !value.decisions.every(isNetworkControlDecision)
    || !value.receipts.every(isNetworkControlReceipt)) return false
  if (value.decision_count !== value.decisions.length
    || value.receipt_count !== value.receipts.length
    || !hasUniqueIds(value.decisions)
    || !hasUniqueIds(value.receipts)) return false
  if (value.receipt_count !== value.decision_count) return false
  const generatedAt = Date.parse(value.generated_at)
  if (value.decisions.some(item => Date.parse(item.decided_at) > generatedAt)
    || value.receipts.some(item => Date.parse(item.recorded_at) > generatedAt)) return false
  const decisions = new Map(value.decisions.map(item => [item.id, item]))
  const receiptDecisionIds = new Set(value.receipts.map(item => item.decision_id))
  return receiptDecisionIds.size === value.decisions.length
    && value.receipts.every((receipt) => {
      const decision = decisions.get(receipt.decision_id)
      return decision?.target_id === receipt.target_id
        && decision.reason_code === receipt.result_code
        && Date.parse(receipt.recorded_at) >= Date.parse(decision.decided_at)
    })
}
