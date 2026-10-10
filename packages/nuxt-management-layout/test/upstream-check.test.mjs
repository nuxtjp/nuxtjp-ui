import { describe, expect, it } from 'vitest'
import { checkSources, exitCodeFor } from '../scripts/lib/upstream-check.mjs'

const lock = expected => ({
  reviewPolicy: 'review-required',
  sources: [{
    id: 'nuxt-layers',
    probes: [{ type: 'contains-text', url: 'https://nuxt.com/docs/4.x/getting-started/layers', expected }]
  }]
})

describe('upstream review policy', () => {
  it('accepts the reviewed marker without changing state', async () => {
    const report = await checkSources(lock('Layers'), { request: async () => 'Nuxt Layers' })
    expect(report.counts).toEqual({ match: 1, mismatch: 0, unavailable: 0 })
    expect(exitCodeFor(report)).toBe(0)
  })

  it('requires review for a mismatch', async () => {
    const report = await checkSources(lock('Layers'), { request: async () => 'Changed page' })
    expect(report.results[0]).toMatchObject({
      result: 'mismatch', disposition: 'review-required'
    })
    expect(exitCodeFor(report)).toBe(2)
  })

  it('fails closed when the source is unavailable', async () => {
    const report = await checkSources(lock('Layers'), {
      request: async () => { throw new Error('offline') }
    })
    expect(report.results[0]).toMatchObject({
      result: 'unavailable', disposition: 'review-required'
    })
    expect(exitCodeFor(report)).toBe(1)
  })
})
