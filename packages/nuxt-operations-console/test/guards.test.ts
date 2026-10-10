// Closed guards are the security boundary between untrusted provider output
// and presentation; the tests focus on privilege and secret-bearing drift.
import { describe, expect, it } from 'vitest'
import {
  isCredentialReadinessDocument,
  isNetworkControlsDocument,
  isNetworkObservationsDocument,
  validateOperationsDocuments
} from '../src/runtime/core'
import { fixtures } from './fixtures'

describe('operations document guards', () => {
  it('accepts the three exact, metadata-only contracts', () => {
    expect(isCredentialReadinessDocument(fixtures.credentialReadiness)).toBe(true)
    expect(isNetworkObservationsDocument(fixtures.networkObservations)).toBe(true)
    expect(isNetworkControlsDocument(fixtures.networkControls)).toBe(true)
    expect(validateOperationsDocuments(fixtures).valid).toBe(true)
  })

  it('rejects credential values and unknown fields', () => {
    const document = structuredClone(fixtures.credentialReadiness)
    const unsafe = document.credentials[0] as typeof document.credentials[number] & {
      secret_value: string
    }
    unsafe.secret_value = 'must-not-cross-the-boundary'
    expect(isCredentialReadinessDocument(document)).toBe(false)
  })

  it('rejects execution capability and wrong contract identifiers', () => {
    expect(isNetworkObservationsDocument({
      ...fixtures.networkObservations,
      external_actions: true
    })).toBe(false)
    expect(isCredentialReadinessDocument({
      ...fixtures.credentialReadiness,
      schema: 'nuxtjp://credentials/status/v1'
    })).toBe(false)
  })

  it('enforces counts and unique identifiers', () => {
    expect(isCredentialReadinessDocument({
      ...fixtures.credentialReadiness,
      credential_count: 99
    })).toBe(false)
    const observations = structuredClone(fixtures.networkObservations)
    observations.observations[1]!.id = observations.observations[0]!.id
    expect(isNetworkObservationsDocument(observations)).toBe(false)
  })

  it('requires receipts to match a declared decision and target', () => {
    const controls = structuredClone(fixtures.networkControls)
    controls.receipts[0]!.target_id = 'another-target'
    expect(isNetworkControlsDocument(controls)).toBe(false)
    controls.receipts[0]!.target_id = controls.decisions[0]!.target_id
    controls.receipts[0]!.result_code = 'different-reason'
    expect(isNetworkControlsDocument(controls)).toBe(false)
  })

  it('requires one immutable dry-run receipt for every decision', () => {
    const controls = structuredClone(fixtures.networkControls)
    controls.receipts.pop()
    controls.receipt_count -= 1
    expect(isNetworkControlsDocument(controls)).toBe(false)
  })

  it('allows an already-expired denied request but not an expired allowance', () => {
    const denied = structuredClone(fixtures.networkControls)
    denied.decisions[0]!.status = 'denied'
    denied.decisions[0]!.matched_rule_id = null
    denied.decisions[0]!.reason_code = 'default-deny'
    denied.receipts[0]!.result_code = 'default-deny'
    denied.decisions[0]!.expires_at = denied.decisions[0]!.decided_at
    expect(isNetworkControlsDocument(denied)).toBe(true)
    denied.decisions[0]!.status = 'allowed-dry-run'
    denied.decisions[0]!.matched_rule_id = 'dry-run-only'
    expect(isNetworkControlsDocument(denied)).toBe(false)
  })

  it('mirrors the producer allowance reason and one-hour window', () => {
    const controls = structuredClone(fixtures.networkControls)
    controls.decisions[0]!.reason_code = 'different-reason'
    controls.receipts[0]!.result_code = 'different-reason'
    expect(isNetworkControlsDocument(controls)).toBe(false)

    const longWindow = structuredClone(fixtures.networkControls)
    longWindow.decisions[0]!.expires_at = '2026-07-27T00:45:00.001Z'
    expect(isNetworkControlsDocument(longWindow)).toBe(false)

    const denied = structuredClone(fixtures.networkControls)
    denied.decisions[0]!.status = 'denied'
    denied.decisions[0]!.matched_rule_id = null
    expect(isNetworkControlsDocument(denied)).toBe(false)
  })

  it('rejects producer events later than the document generation time', () => {
    const decision = structuredClone(fixtures.networkControls)
    decision.decisions[0]!.decided_at = '2026-07-27T00:00:00.001Z'
    expect(isNetworkControlsDocument(decision)).toBe(false)

    const receipt = structuredClone(fixtures.networkControls)
    receipt.receipts[0]!.recorded_at = '2026-07-27T00:00:00.001Z'
    expect(isNetworkControlsDocument(receipt)).toBe(false)
  })

  it('limits control decisions and receipts to the producer contract bound', () => {
    const controls = structuredClone(fixtures.networkControls)
    controls.decisions = Array.from({ length: 257 }, (_, index) => ({
      ...controls.decisions[0]!,
      id: `decision-${index}`
    }))
    controls.decision_count = controls.decisions.length
    expect(isNetworkControlsDocument(controls)).toBe(false)
  })

  it('bounds projections and rejects control characters in display text', () => {
    const credentials = structuredClone(fixtures.credentialReadiness)
    credentials.credentials[0]!.label = 'unsafe\nheader'
    expect(isCredentialReadinessDocument(credentials)).toBe(false)
    const observations = structuredClone(fixtures.networkObservations)
    observations.observations = Array(1025).fill(observations.observations[0])
    observations.observation_count = 1025
    expect(isNetworkObservationsDocument(observations)).toBe(false)
  })

  it('accepts only canonical UTC millisecond timestamps', () => {
    const observations = structuredClone(fixtures.networkObservations)
    observations.generated_at = '2026-02-30T00:00:00.000Z'
    expect(isNetworkObservationsDocument(observations)).toBe(false)
    observations.generated_at = '2026-07-27T09:00:00+09:00'
    expect(isNetworkObservationsDocument(observations)).toBe(false)
  })

  it('counts Unicode code points and rejects bidirectional controls', () => {
    const observations = structuredClone(fixtures.networkObservations)
    observations.observations[0]!.label = '😀'.repeat(128)
    expect(isNetworkObservationsDocument(observations)).toBe(true)
    observations.observations[0]!.label = '😀'.repeat(129)
    expect(isNetworkObservationsDocument(observations)).toBe(false)
    observations.observations[0]!.label = 'trusted\u202Egnol'
    expect(isNetworkObservationsDocument(observations)).toBe(false)
  })

  it('returns a detached and frozen snapshot after validation', () => {
    const input = structuredClone(fixtures)
    const result = validateOperationsDocuments(input)
    expect(result.valid).toBe(true)
    if (!result.valid) throw new Error('fixture validation failed')
    input.credentialReadiness.credentials[0]!.label = 'caller mutation'
    expect(result.documents.credentialReadiness.credentials[0]!.label)
      .toBe('外部API接続')
    expect(Object.isFrozen(result.documents.networkControls.decisions)).toBe(true)
  })
})
