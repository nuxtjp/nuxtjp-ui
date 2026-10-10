import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import Ajv2020 from 'ajv/dist/2020'
import { describe, expect, it } from 'vitest'
import credentialSchema from '../schemas/credential-readiness-v1.schema.json'
import coverageSchema from '../schemas/control-coverage-snapshot-v2.schema.json'
import controlSchema from '../schemas/network-controls-v1.schema.json'
import observationSchema from '../schemas/network-observations-v1.schema.json'
import topologySchema from '../schemas/network-topology-v1.schema.json'
import { fixtures } from './fixtures'

const cases = [
  [credentialSchema, fixtures.credentialReadiness],
  [coverageSchema, fixtures.controlCoverage],
  [observationSchema, fixtures.networkObservations],
  [controlSchema, fixtures.networkControls],
  [topologySchema, fixtures.networkTopology]
] as const

function compile(schema: object) {
  const ajv = new Ajv2020({ strict: true })
  ajv.addFormat('date-time', (value) => {
    const instant = new Date(value)
    return Number.isFinite(instant.getTime()) && instant.toISOString() === value
  })
  return ajv.compile(schema)
}

describe('published JSON Schemas', () => {
  it('pins the exact producer-owned control coverage schema', () => {
    const bytes = readFileSync(resolve(
      import.meta.dirname, '../schemas/control-coverage-snapshot-v2.schema.json'
    ))
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(
      '8b54136ecbdd197dc036c46958af2df16f39436342120c04a2f82838cf75bbd4'
    )
  })

  it.each(cases)('accepts its sample projection', (schema, fixture) => {
    const validate = compile(schema)
    expect(validate(fixture), JSON.stringify(validate.errors)).toBe(true)
  })

  it.each(cases)('rejects undeclared top-level data', (schema, fixture) => {
    const validate = compile(schema)
    expect(validate({ ...fixture, internal_state: true })).toBe(false)
  })

  it('rejects invalid calendar dates and non-canonical offsets', () => {
    const validate = compile(observationSchema)
    expect(validate({
      ...fixtures.networkObservations,
      generated_at: '2026-02-30T00:00:00.000Z'
    })).toBe(false)
    expect(validate({
      ...fixtures.networkObservations,
      generated_at: '2026-07-27T09:00:00+09:00'
    })).toBe(false)
  })
})
