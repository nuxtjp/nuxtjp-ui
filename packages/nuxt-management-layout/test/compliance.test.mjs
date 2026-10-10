import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { verifyContract } from '../scripts/lib/contract-verify.mjs'

describe('machine-readable repository contract', () => {
  it('keeps schemas, evidence, boundaries and source limits valid', async () => {
    const report = await verifyContract(resolve(import.meta.dirname, '..'))
    expect(report.errors).toEqual([])
    expect(report.valid).toBe(true)
    expect(report.summary.sources).toBe(8)
    expect(report.summary.requirements).toBe(14)
  })
})
