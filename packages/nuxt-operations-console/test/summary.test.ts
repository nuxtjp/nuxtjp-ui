import { describe, expect, it } from 'vitest'
import {
  credentialDisplayStatus,
  decisionDisplayStatus,
  formatLatency,
  observationDisplayStatus,
  resolveLabels,
  statusLabel,
  summarizeOperations,
  validateOperationsDocuments
} from '../src/runtime/core'
import { fixtures } from './fixtures'

describe('operations presentation', () => {
  it('summarizes only successfully validated documents', () => {
    const validation = validateOperationsDocuments(fixtures)
    expect(validation.valid).toBe(true)
    if (!validation.valid) throw new Error('fixture validation failed')
    expect(summarizeOperations(
      validation.documents,
      Date.parse('2026-07-27T09:01:00+09:00')
    )).toEqual({
      credentialTotal: 2,
      credentialReady: 1,
      credentialAttention: 1,
      networkTotal: 2,
      networkHealthy: 1,
      networkAttention: 1,
      decisionTotal: 2,
      decisionDenied: 1,
      decisionExpired: 0,
      receiptTotal: 2,
      receiptRecorded: 2,
      staleDocumentCount: 0,
      overallStatus: 'attention'
    })
  })

  it('never reports stale projections as ready', () => {
    const ready = structuredClone(fixtures)
    ready.credentialReadiness.credentials = []
    ready.credentialReadiness.credential_count = 0
    ready.networkObservations.observations = []
    ready.networkObservations.observation_count = 0
    ready.networkControls.decisions = []
    ready.networkControls.receipts = []
    ready.networkControls.decision_count = 0
    ready.networkControls.receipt_count = 0
    const validation = validateOperationsDocuments(ready)
    expect(validation.valid).toBe(true)
    if (!validation.valid) throw new Error('fixture validation failed')
    const summary = summarizeOperations(
      validation.documents,
      Date.parse('2026-07-27T10:00:00+09:00')
    )
    expect(summary.staleDocumentCount).toBe(3)
    expect(summary.overallStatus).toBe('attention')
  })

  it('defaults to Japanese while allowing English and explicit overrides', () => {
    expect(resolveLabels('ja').heading).toBe('運用基盤コンソール')
    expect(resolveLabels('en').heading).toBe('Operations foundation console')
    expect(resolveLabels('ja', { heading: '運用状況' }).heading).toBe('運用状況')
    expect(statusLabel('unavailable', 'ja')).toBe('利用不可')
  })

  it('formats optional metrics without inventing observations', () => {
    expect(formatLatency(2.45)).toBe('2.5 ms')
    expect(formatLatency(null)).toBe('—')
  })

  it('downgrades stale or expired row statuses at presentation time', () => {
    const late = Date.parse('2026-07-27T10:00:00+09:00')
    const validation = validateOperationsDocuments(fixtures)
    if (!validation.valid) throw new Error('fixture validation failed')
    expect(credentialDisplayStatus(
      validation.documents.credentialReadiness.credentials[0]!,
      late
    )).toBe('unavailable')
    expect(observationDisplayStatus(
      validation.documents.networkObservations.observations[0]!,
      late
    )).toBe('unavailable')
    expect(decisionDisplayStatus(
      validation.documents.networkControls.decisions[1]!,
      late
    )).toBe('denied')
  })
})
