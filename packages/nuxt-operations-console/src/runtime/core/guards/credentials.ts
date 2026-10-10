import {
  CREDENTIAL_READINESS_SCHEMA,
  type CredentialReadiness,
  type CredentialReadinessDocument
} from '../types'
import {
  hasExactKeys,
  hasUniqueIds,
  isBoundedArray,
  isCount,
  isNullableUnixSeconds,
  isRecord,
  isSafeDisplayText,
  isUniqueIdentifierArray,
  isUnixSeconds
} from './primitives'

const statuses = ['ready', 'expired', 'revoked', 'unavailable']
const credentialKeys = [
  'id', 'label', 'provider', 'purpose', 'status', 'store_kind', 'scope',
  'checked_at', 'expires_at', 'rotation_due_at', 'finding_codes'
]
const documentKeys = [
  'schema', 'generated_at', 'external_actions', 'contains_secret_values',
  'credential_count', 'credentials'
]
const scopeKeys = ['tenant', 'service', 'audience']

function isOneOf(value: unknown, choices: readonly string[]): value is string {
  return typeof value === 'string' && choices.includes(value)
}

function isComponent(value: unknown, maxLength: number): value is string {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= maxLength
    && /^[A-Za-z0-9][A-Za-z0-9._-]*$/u.test(value)
}

function isReferenceId(value: unknown): value is string {
  return typeof value === 'string'
    && value.length >= 5
    && value.length <= 420
    && /^[A-Za-z0-9][A-Za-z0-9._/-]*$/u.test(value)
}

function isCredentialScope(value: unknown): boolean {
  return isRecord(value)
    && hasExactKeys(value, scopeKeys)
    && isComponent(value.tenant, 64)
    && isComponent(value.service, 64)
    && isComponent(value.audience, 96)
}

export function isCredentialReadiness(value: unknown): value is CredentialReadiness {
  if (!isRecord(value) || !hasExactKeys(value, credentialKeys)) return false
  return isReferenceId(value.id)
    && isSafeDisplayText(value.label, 160)
    && isComponent(value.provider, 64)
    && isComponent(value.purpose, 96)
    && isOneOf(value.status, statuses)
    && isComponent(value.store_kind, 64)
    && isCredentialScope(value.scope)
    && isUnixSeconds(value.checked_at)
    && isNullableUnixSeconds(value.expires_at)
    && isNullableUnixSeconds(value.rotation_due_at)
    && isUniqueIdentifierArray(value.finding_codes)
}

export function isCredentialReadinessDocument(
  value: unknown
): value is CredentialReadinessDocument {
  if (!isRecord(value) || !hasExactKeys(value, documentKeys)) return false
  if (value.schema !== CREDENTIAL_READINESS_SCHEMA
    || value.external_actions !== false
    || value.contains_secret_values !== false
    || !isUnixSeconds(value.generated_at)
    || !isCount(value.credential_count)
    || !isBoundedArray(value.credentials)
    || !value.credentials.every(isCredentialReadiness)) return false
  return value.credential_count === value.credentials.length
    && hasUniqueIds(value.credentials)
}
