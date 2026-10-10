import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  credentialDisplayStatus,
  decisionDisplayStatus,
  observationDisplayStatus,
  validateOperationsDocuments
} from '../src/runtime/core'
import { startReactiveClock } from '../src/runtime/app/composables/useReactiveNow'
import { fixtures } from './fixtures'

describe('reactive presentation clock', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-27T00:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('updates on schedule and stops cleanly', () => {
    const updates: number[] = []
    const stop = startReactiveClock(value => updates.push(value), 1_000)
    vi.advanceTimersByTime(2_000)
    expect(updates).toEqual([
      Date.parse('2026-07-27T00:00:01.000Z'),
      Date.parse('2026-07-27T00:00:02.000Z')
    ])
    stop()
    vi.advanceTimersByTime(1_000)
    expect(updates).toHaveLength(2)
  })

  it('re-evaluates every row when the presentation clock crosses five minutes', () => {
    const validation = validateOperationsDocuments(fixtures)
    if (!validation.valid) throw new Error('fixture validation failed')
    const credential = validation.documents.credentialReadiness.credentials[0]!
    const observation = validation.documents.networkObservations.observations[0]!
    const decision = validation.documents.networkControls.decisions[0]!
    expect(credentialDisplayStatus(credential, Date.now())).toBe('ready')
    expect(observationDisplayStatus(observation, Date.now())).toBe('reachable')
    expect(decisionDisplayStatus(decision, Date.now())).toBe('allowed-dry-run')

    vi.advanceTimersByTime(5 * 60 * 1_000 + 1)
    expect(credentialDisplayStatus(credential, Date.now())).toBe('unavailable')
    expect(observationDisplayStatus(observation, Date.now())).toBe('unavailable')
    expect(decisionDisplayStatus(decision, Date.now())).toBe('expired')
  })
})
