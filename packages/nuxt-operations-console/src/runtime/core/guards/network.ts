import {
  NETWORK_OBSERVATIONS_SCHEMA,
  type NetworkObservation,
  type NetworkObservationsDocument
} from '../types'
import {
  hasExactKeys,
  hasUniqueIds,
  isBoundedArray,
  isCount,
  isIdentifier,
  isNullableNumber,
  isRecord,
  isSafeDisplayText,
  isUniqueIdentifierArray,
  isTimestamp
} from './primitives'

const statuses = ['reachable', 'observed', 'degraded', 'unavailable']
const observationKeys = [
  'id', 'target_id', 'label', 'zone', 'protocol', 'status', 'observed_at',
  'latency_ms', 'packet_loss_percent', 'source', 'finding_codes'
]
const documentKeys = [
  'schema', 'generated_at', 'external_actions', 'observation_count', 'observations'
]

function isOneOf(value: unknown, choices: readonly string[]): value is string {
  return typeof value === 'string' && choices.includes(value)
}

export function isNetworkObservation(value: unknown): value is NetworkObservation {
  if (!isRecord(value) || !hasExactKeys(value, observationKeys)) return false
  return isIdentifier(value.id)
    && isIdentifier(value.target_id)
    && isSafeDisplayText(value.label, 128)
    && isIdentifier(value.zone)
    && isIdentifier(value.protocol)
    && isOneOf(value.status, statuses)
    && isTimestamp(value.observed_at)
    && (value.latency_ms === null || isCount(value.latency_ms))
    && isNullableNumber(value.packet_loss_percent, 0, 100)
    && isIdentifier(value.source)
    && isUniqueIdentifierArray(value.finding_codes)
}

export function isNetworkObservationsDocument(
  value: unknown
): value is NetworkObservationsDocument {
  if (!isRecord(value) || !hasExactKeys(value, documentKeys)) return false
  if (value.schema !== NETWORK_OBSERVATIONS_SCHEMA
    || value.external_actions !== false
    || !isTimestamp(value.generated_at)
    || !isCount(value.observation_count)
    || !isBoundedArray(value.observations)
    || !value.observations.every(isNetworkObservation)) return false
  return value.observation_count === value.observations.length
    && hasUniqueIds(value.observations)
}
