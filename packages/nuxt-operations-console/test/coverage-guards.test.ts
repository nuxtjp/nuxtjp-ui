import { describe, expect, it } from 'vitest'
import { isControlCoverageDocument } from '../src/runtime/core'
import { fixtures } from './fixtures'

describe('control coverage snapshot guard', () => {
  it('accepts the exact producer snapshot', () => {
    expect(isControlCoverageDocument(fixtures.controlCoverage)).toBe(true)
  })

  it('rejects capabilities, secrets, and unknown fields', () => {
    expect(isControlCoverageDocument({
      ...fixtures.controlCoverage,
      external_actions: true
    })).toBe(false)
    const secret = structuredClone(fixtures.controlCoverage)
    Object.assign(secret.assets[0]!, { credential: 'must-not-cross' })
    expect(isControlCoverageDocument(secret)).toBe(false)
  })

  it('requires unique assets and exact producer counts', () => {
    const duplicate = structuredClone(fixtures.controlCoverage)
    duplicate.assets[1]!.id = duplicate.assets[0]!.id
    expect(isControlCoverageDocument(duplicate)).toBe(false)
    const count = structuredClone(fixtures.controlCoverage)
    count.summary.gap_count = 0
    expect(isControlCoverageDocument(count)).toBe(false)
  })

  it('does not accept a gap as controlled or isolation-ready', () => {
    const overall = structuredClone(fixtures.controlCoverage)
    overall.overall_state = 'controlled'
    expect(isControlCoverageDocument(overall)).toBe(false)
    const asset = structuredClone(fixtures.controlCoverage)
    asset.assets[1]!.isolation_ready = true
    expect(isControlCoverageDocument(asset)).toBe(false)
  })

  it('requires findings for every non-controlled asset', () => {
    const document = structuredClone(fixtures.controlCoverage)
    document.assets[2]!.finding_codes = []
    expect(isControlCoverageDocument(document)).toBe(false)
    const controlled = structuredClone(fixtures.controlCoverage)
    controlled.assets[0]!.finding_codes = ['unexpected-finding']
    expect(isControlCoverageDocument(controlled)).toBe(false)
  })

  it('bounds finding codes at the browser trust boundary', () => {
    const document = structuredClone(fixtures.controlCoverage)
    document.assets[1]!.finding_codes = Array.from(
      { length: 65 }, (_, index) => `finding-${index}`)
    expect(isControlCoverageDocument(document)).toBe(false)
  })
})
