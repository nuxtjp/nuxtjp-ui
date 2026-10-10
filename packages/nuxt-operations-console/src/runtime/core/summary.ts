import type { OperationsSummary } from './types/index'
import type { ValidOperationsDocuments } from './validation'
import { isFreshProjection, isFuture } from './freshness'

export function summarizeOperations(
  documents: ValidOperationsDocuments,
  now: number | Date = Date.now()
): OperationsSummary {
  const credentialReady = documents.credentialReadiness.credentials
    .filter(item => item.status === 'ready'
      && isFreshProjection(item.checked_at, now)
      && isFuture(item.expires_at, now)).length
  const networkHealthy = documents.networkObservations.observations
    .filter(item => (item.status === 'reachable' || item.status === 'observed')
      && isFreshProjection(item.observed_at, now)).length
  const decisionDenied = documents.networkControls.decisions
    .filter(item => item.status === 'denied').length
  const decisionExpired = documents.networkControls.decisions
    .filter(item => item.status === 'allowed-dry-run' && !isFuture(item.expires_at, now)).length
  const receiptRecorded = documents.networkControls.receipts
    .filter(item => item.status === 'recorded').length
  const credentialTotal = documents.credentialReadiness.credential_count
  const networkTotal = documents.networkObservations.observation_count
  const decisionTotal = documents.networkControls.decision_count
  const receiptTotal = documents.networkControls.receipt_count
  const credentialAttention = credentialTotal - credentialReady
  const networkAttention = networkTotal - networkHealthy
  const staleDocumentCount = [
    documents.credentialReadiness.generated_at,
    documents.networkObservations.generated_at,
    documents.networkControls.generated_at
  ].filter(value => !isFreshProjection(value, now)).length
  const attention = credentialAttention + networkAttention + decisionDenied
    + decisionExpired + staleDocumentCount
  return {
    credentialTotal,
    credentialReady,
    credentialAttention,
    networkTotal,
    networkHealthy,
    networkAttention,
    decisionTotal,
    decisionDenied,
    decisionExpired,
    receiptTotal,
    receiptRecorded,
    staleDocumentCount,
    overallStatus: attention === 0 ? 'ready' : 'attention'
  }
}
