import { describe, expect, it } from 'vitest'
import {
  isFreshNetworkTopologyDocument,
  isNetworkTopologyDocument
} from '../src/runtime/core'
import { fixtures } from './fixtures'

describe('network topology guard', () => {
  it('accepts the exact metadata-only projection', () => {
    expect(isNetworkTopologyDocument(fixtures.networkTopology)).toBe(true)
  })

  it('rejects action capability, dangling edges, and count drift', () => {
    expect(isNetworkTopologyDocument({
      ...fixtures.networkTopology,
      external_actions: true
    })).toBe(false)
    const dangling = structuredClone(fixtures.networkTopology)
    dangling.edges[0]!.target_node_id = 'missing-node'
    expect(isNetworkTopologyDocument(dangling)).toBe(false)
    expect(isNetworkTopologyDocument({
      ...fixtures.networkTopology,
      summary: { ...fixtures.networkTopology.summary, node_count: 99 }
    })).toBe(false)
  })

  it('keeps the projection free of addresses and packet data', () => {
    const encoded = JSON.stringify(fixtures.networkTopology)
    expect(encoded).not.toMatch(/ip_address|mac_address|packet|credential/i)
  })

  it('rejects forged aggregate and evidence semantics', () => {
    expect(isNetworkTopologyDocument({
      ...fixtures.networkTopology,
      overall_status: 'healthy'
    })).toBe(false)
    const disconnected = structuredClone(fixtures.networkTopology)
    disconnected.nodes[5]!.status = 'healthy'
    expect(isNetworkTopologyDocument(disconnected)).toBe(false)
    const edgeDrift = structuredClone(fixtures.networkTopology)
    edgeDrift.edges[0]!.status = 'healthy'
    expect(isNetworkTopologyDocument(edgeDrift)).toBe(false)
  })

  it('uses trusted time when freshness affects a security decision', () => {
    const generated = Date.parse(fixtures.networkTopology.generated_at)
    expect(isFreshNetworkTopologyDocument(
      fixtures.networkTopology, generated + 60_000
    )).toBe(true)
    expect(isFreshNetworkTopologyDocument(
      fixtures.networkTopology, generated + 301_000
    )).toBe(false)
  })
})
