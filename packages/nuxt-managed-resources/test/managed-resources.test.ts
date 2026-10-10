// One fixture is validated across schema, runtime guards, selectors, and
// summaries so the published contract cannot drift between package layers.
import { describe, expect, it } from 'vitest'
import Ajv2020 from 'ajv/dist/2020'
import schema from '../schemas/managed-resources-v1.schema.json'
import { filterResources, statusTone, summarizeResources } from '../src/runtime/shared/resources'
import { isManagedResourceDetailDocument, isManagedResourcesDocument } from '../src/runtime/shared/guards'
import type { ManagedResourcesDocument, ManagedResource } from '../src/runtime/shared/types'

const resource: ManagedResource = {
  id: 'example-resource',
  name: 'Example Resource',
  summary: '宣言的なサンプル',
  resource_kind: 'local-resource',
  category: 'example',
  exposure: 'internal',
  status: 'active',
  owner_organization: { id: 'example', name: 'Example Organization' },
  accountability: {
    primary_department_id: 'platform',
    primary_team_id: 'platform-team-01',
    label: '運用責任'
  },
  readiness: {
    status: 'ready',
    managed_repository_count: 1,
    ready_repository_count: 1,
    linkage_attention_count: 0
  },
  repositories: [{
    id: 'example-repository',
    name: 'example',
    organization_id: 'example',
    source_organization_id: 'example-source-host',
    placement_scope: 'ecosystem-provider',
    lifecycle: 'foundation-active',
    kind: 'rust-cli',
    visibility: 'private',
    package_name: 'example',
    checks: [{ name: 'cargo-test', status: 'declared' }],
    readiness: {
      status: 'ready',
      exists: true,
      identity_valid: true,
      git_initialized: true,
      manifest_valid: true,
      package_count: 1,
      finding_codes: []
    },
    observation: {
      mode: 'metadata-only-local',
      observed_at_unix_seconds: 1,
      dirty_entry_count: 0,
      ready: true,
      content_read: false,
      external_actions: false
    }
  }],
  incoming_linkages: [],
  outgoing_linkages: [{
    id: 'example-link',
    name: 'Example link',
    other_resource_id: 'consumer',
    other_resource_name: 'Consumer',
    relationship: 'projection',
    interface_kind: 'json',
    operation_mode: 'local-simulation',
    configuration_status: 'active',
    contract_status: 'verified',
    machine_status: 'ready',
    human_review_status: 'pending',
    overall_status: 'ready',
    external_actions: false
  }]
}

const document: ManagedResourcesDocument = {
  schema: 'nuxtjp://managed-resources/list/v1',
  mode: 'metadata-only-local',
  observed_at_unix_seconds: 1,
  external_actions: false,
  healthy: true,
  resource_count: 1,
  resources: [resource]
}

describe('managed resources contract', () => {
  it('accepts closed list and detail documents', () => {
    expect(isManagedResourcesDocument(document)).toBe(true)
    expect(isManagedResourceDetailDocument({
      schema: 'nuxtjp://managed-resources/detail/v1',
      mode: document.mode,
      observed_at_unix_seconds: document.observed_at_unix_seconds,
      external_actions: false,
      resource
    })).toBe(true)
  })

  it('rejects unknown fields and external actions', () => {
    expect(isManagedResourcesDocument({ ...document, copied_resource_data: true })).toBe(false)
    expect(isManagedResourcesDocument({ ...document, external_actions: true })).toBe(false)
  })

  it('separates operating custody from optional source hosting', () => {
    const withoutSourceHost = structuredClone(document)
    withoutSourceHost.resources[0]!.repositories[0]!.source_organization_id = null
    expect(isManagedResourcesDocument(withoutSourceHost)).toBe(true)
    const missingPlacement = structuredClone(document) as unknown as Record<string, unknown>
    const resources = missingPlacement.resources as Array<ManagedResource>
    delete (resources[0]!.repositories[0] as Partial<ManagedResource['repositories'][number]>)
      .placement_scope
    expect(isManagedResourcesDocument(missingPlacement)).toBe(false)
  })

  it('keeps runtime guards aligned with nested schema constraints', () => {
    const validate = new Ajv2020({ strict: true }).compile(schema)
    const blankFinding = structuredClone(document)
    blankFinding.resources[0]!.repositories[0]!.readiness.finding_codes = ['']
    expect(validate(blankFinding)).toBe(false)
    expect(isManagedResourcesDocument(blankFinding)).toBe(false)

    const unknownReadinessField = structuredClone(document) as ManagedResourcesDocument & {
      resources: Array<ManagedResource & { readiness: ManagedResource['readiness'] & { inferred: boolean } }>
    }
    unknownReadinessField.resources[0]!.readiness.inferred = true
    expect(validate(unknownReadinessField)).toBe(false)
    expect(isManagedResourcesDocument(unknownReadinessField)).toBe(false)
  })

  it('enforces resources invariants that JSON Schema cannot express', () => {
    const mismatchedCount = { ...document, resource_count: 2 }
    const validate = new Ajv2020({ strict: true }).compile(schema)
    expect(validate(mismatchedCount)).toBe(true)
    expect(isManagedResourcesDocument(mismatchedCount)).toBe(false)
  })

  it('keeps the runtime fixture valid against the published JSON Schema', () => {
    const validate = new Ajv2020({ strict: true }).compile(schema)
    expect(validate(document), validate.errors?.map(error => error.message).join(', ')).toBe(true)
  })

  it('filters and summarizes descriptors without copied presentation data', () => {
    expect(filterResources([resource], { query: 'repository' })).toEqual([resource])
    expect(filterResources([resource], { organizationId: 'other' })).toEqual([])
    expect(summarizeResources([resource])).toEqual({
      resourceCount: 1,
      readyResourceCount: 1,
      repositoryCount: 1,
      readyRepositoryCount: 1,
      linkageCount: 1,
      attentionCount: 0
    })
    expect(statusTone('ready')).toBe('positive')
    expect(statusTone('attention')).toBe('warning')
  })
})
