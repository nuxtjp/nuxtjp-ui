import type { NetworkHealthStatus } from './common'

export const NETWORK_OBSERVATIONS_SCHEMA = 'crowsi://network/observations/v1' as const

export interface NetworkObservation {
  id: string
  target_id: string
  label: string
  zone: string
  protocol: string
  status: NetworkHealthStatus
  observed_at: string
  latency_ms: number | null
  packet_loss_percent: number | null
  source: string
  finding_codes: string[]
}

export interface NetworkObservationsDocument {
  schema: typeof NETWORK_OBSERVATIONS_SCHEMA
  generated_at: string
  external_actions: false
  observation_count: number
  observations: NetworkObservation[]
}
