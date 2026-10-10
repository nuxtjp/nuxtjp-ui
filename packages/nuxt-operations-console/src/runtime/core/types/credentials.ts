import type { ReadinessStatus } from './common'

export const CREDENTIAL_READINESS_SCHEMA = 'crowsi://credentials/status/v1' as const

export interface CredentialScope {
  tenant: string
  service: string
  audience: string
}

export interface CredentialReadiness {
  id: string
  label: string
  provider: string
  purpose: string
  status: ReadinessStatus
  store_kind: string
  scope: CredentialScope
  checked_at: number
  expires_at: number | null
  rotation_due_at: number | null
  finding_codes: string[]
}

/**
 * This projection deliberately has no field capable of carrying credential
 * material. Unknown fields are rejected at the trust boundary.
 */
export interface CredentialReadinessDocument {
  schema: typeof CREDENTIAL_READINESS_SCHEMA
  generated_at: number
  external_actions: false
  contains_secret_values: false
  credential_count: number
  credentials: CredentialReadiness[]
}
