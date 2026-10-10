export type OperationsLocale = 'ja' | 'en'

export type ReadinessStatus =
  | 'ready'
  | 'expired'
  | 'revoked'
  | 'unavailable'

export type NetworkHealthStatus =
  | 'reachable'
  | 'observed'
  | 'degraded'
  | 'unavailable'

export type ControlDecisionStatus =
  | 'allowed-dry-run'
  | 'denied'

export type ControlReceiptStatus = 'recorded'

export interface OperationsDocuments {
  credentialReadiness: unknown
  networkObservations: unknown
  networkControls: unknown
}

export interface OperationsValidation {
  credentialReadiness: boolean
  networkObservations: boolean
  networkControls: boolean
  valid: boolean
}
