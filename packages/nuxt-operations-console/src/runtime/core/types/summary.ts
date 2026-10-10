export type OperationsOverallStatus = 'ready' | 'attention'

export interface OperationsSummary {
  credentialTotal: number
  credentialReady: number
  credentialAttention: number
  networkTotal: number
  networkHealthy: number
  networkAttention: number
  decisionTotal: number
  decisionDenied: number
  decisionExpired: number
  receiptTotal: number
  receiptRecorded: number
  staleDocumentCount: number
  overallStatus: OperationsOverallStatus
}

export interface OperationsConsoleLabels {
  heading: string
  description: string
  invalid: string
  credentials: string
  networks: string
  controls: string
  ready: string
  attention: string
  status: string
  provider: string
  purpose: string
  scope: string
  storage: string
  checkedAt: string
  target: string
  protocol: string
  latency: string
  observedAt: string
  action: string
  decision: string
  result: string
  recordedAt: string
  stale: string
  dryRunNotice: string
  none: string
}
