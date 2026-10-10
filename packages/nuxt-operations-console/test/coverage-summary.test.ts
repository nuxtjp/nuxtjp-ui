import { describe, expect, it } from 'vitest'
import {
  controlCoverageAssetState,
  controlCoverageFindingLabel,
  controlCoverageFindings,
  controlCoverageIsolationReady,
  isControlCoverageDocument,
  statusTone,
  summarizeControlCoverage
} from '../src/runtime/core'
import { fixtures } from './fixtures'

function document() {
  const value: unknown = structuredClone(fixtures.controlCoverage)
  if (!isControlCoverageDocument(value)) throw new Error('invalid fixture')
  return value
}

describe('control coverage presentation', () => {
  it('summarizes fresh producer evidence without inventing control', () => {
    const value = document()
    const now = value.generated_at_epoch_s * 1000 + 60_000
    expect(summarizeControlCoverage(value, now)).toEqual({
      state: 'unmanaged',
      assetCount: 4,
      controlledCount: 1,
      gapCount: 3,
      stale: false
    })
    expect(controlCoverageIsolationReady(value.assets[0]!, value.generated_at_epoch_s, now))
      .toBe(true)
  })

  it('downgrades every controlled claim when the snapshot is stale', () => {
    const value = document()
    const now = value.generated_at_epoch_s * 1000 + 301_000
    expect(summarizeControlCoverage(value, now)).toMatchObject({
      state: 'unknown', controlledCount: 0, gapCount: 4, stale: true
    })
    expect(controlCoverageAssetState(
      value.assets[0]!, value.generated_at_epoch_s, now
    )).toBe('unknown')
    expect(controlCoverageIsolationReady(
      value.assets[0]!, value.generated_at_epoch_s, now
    )).toBe(false)
    expect(controlCoverageFindings(
      value.assets[0]!, value.generated_at_epoch_s, now
    )).toContain('coverage-snapshot-stale')
  })

  it('uses non-positive tones for every coverage gap state', () => {
    expect(statusTone('controlled')).toBe('positive')
    expect(statusTone('partial')).toBe('warning')
    expect(statusTone('unknown')).toBe('negative')
    expect(statusTone('unmanaged')).toBe('negative')
  })

  it('keeps exact finding codes traceable with localized explanations', () => {
    expect(controlCoverageFindingLabel('management-authority-missing', 'ja'))
      .toContain('管理権限')
    expect(controlCoverageFindingLabel('management-lifeline-unverified', 'en'))
      .toContain('lifeline')
    expect(controlCoverageFindingLabel('future-producer-finding', 'ja'))
      .toBe('future-producer-finding')
  })
})
