import {
  NETWORK_TOPOLOGY_SCHEMA,
  type NetworkTopologyDocument,
  type NetworkTopologyEdge,
  type NetworkTopologyMetrics,
  type NetworkTopologyNode
} from '../types'
import {
  hasExactKeys, hasUniqueIds, isBoundedArray, isCount, isIdentifier,
  isRecord, isSafeDisplayText, isTimestamp, isUniqueIdentifierArray
} from './primitives'
import { isFreshProjection } from '../freshness'

const statuses = ['healthy', 'attention', 'unknown', 'observed']
const evidenceModes = ['live-observation', 'declared', 'not-connected']
const kinds = ['observer', 'boundary-monitor', 'interface', 'environment']
const nodeKeys = [
  'id', 'label', 'kind', 'zone', 'status', 'source', 'evidence_mode',
  'isolation_mode', 'finding_codes', 'column', 'row', 'metrics'
]
const edgeKeys = [
  'id', 'source_node_id', 'target_node_id', 'relation', 'status',
  'evidence_mode'
]
const summaryKeys = [
  'node_count', 'edge_count', 'healthy_count', 'attention_count',
  'unknown_count', 'observed_count'
]
const documentKeys = [
  'schema', 'generated_at', 'external_actions', 'projection_mode',
  'overall_status', 'summary', 'nodes', 'edges'
]

function oneOf(value: unknown, choices: readonly string[]): value is string {
  return typeof value === 'string' && choices.includes(value)
}

function isPosition(value: unknown): value is number {
  return isCount(value) && value >= 1 && value <= 32
}

function isMetrics(value: unknown): value is NetworkTopologyMetrics {
  return isRecord(value)
    && hasExactKeys(value, ['project_count', 'network_count', 'instance_count'])
    && isCount(value.project_count)
    && isCount(value.network_count)
    && isCount(value.instance_count)
}

function isNode(value: unknown): value is NetworkTopologyNode {
  return isRecord(value) && hasExactKeys(value, nodeKeys)
    && isIdentifier(value.id) && isSafeDisplayText(value.label)
    && oneOf(value.kind, kinds) && isIdentifier(value.zone)
    && oneOf(value.status, statuses) && isIdentifier(value.source)
    && oneOf(value.evidence_mode, evidenceModes)
    && (value.isolation_mode === null || isIdentifier(value.isolation_mode))
    && isUniqueIdentifierArray(value.finding_codes)
    && isPosition(value.column) && isPosition(value.row)
    && isMetrics(value.metrics)
}

function isEdge(value: unknown): value is NetworkTopologyEdge {
  return isRecord(value) && hasExactKeys(value, edgeKeys)
    && isIdentifier(value.id)
    && isIdentifier(value.source_node_id)
    && isIdentifier(value.target_node_id)
    && value.source_node_id !== value.target_node_id
    && value.relation === 'observes'
    && oneOf(value.status, statuses)
    && oneOf(value.evidence_mode, evidenceModes)
}

export function isNetworkTopologyDocument(
  value: unknown
): value is NetworkTopologyDocument {
  if (!isRecord(value) || !hasExactKeys(value, documentKeys)
    || value.schema !== NETWORK_TOPOLOGY_SCHEMA
    || value.external_actions !== false || !isTimestamp(value.generated_at)
    || !oneOf(value.projection_mode, [
      'live-local', 'mixed-local-and-declared', 'simulation'
    ]) || !oneOf(value.overall_status, ['healthy', 'attention', 'unknown'])
    || !isRecord(value.summary) || !hasExactKeys(value.summary, summaryKeys)
    || !isBoundedArray(value.nodes, 128) || !value.nodes.every(isNode)
    || !isBoundedArray(value.edges, 256) || !value.edges.every(isEdge)
    || !hasUniqueIds(value.nodes) || !hasUniqueIds(value.edges)) return false
  const nodes = value.nodes as NetworkTopologyNode[]
  const edges = value.edges as NetworkTopologyEdge[]
  const document = value as unknown as NetworkTopologyDocument
  const ids = new Set(nodes.map(node => node.id))
  if (!edges.every(edge =>
    ids.has(edge.source_node_id) && ids.has(edge.target_node_id))) return false
  const byId = new Map(nodes.map(node => [node.id, node]))
  if (!nodes.every(evidenceMatchesStatus)
    || !edges.every(edge => evidenceMatchesStatus(edge)
      && edge.status === byId.get(edge.target_node_id)?.status
      && edge.evidence_mode === byId.get(edge.target_node_id)?.evidence_mode)
    || !projectionMatchesEvidence(document, nodes, edges)) return false
  const counts = statuses.map(status =>
    nodes.filter(node => node.status === status).length)
  const expectedOverall = nodes.some(node => node.status === 'attention')
    ? 'attention'
    : nodes.some(node => node.status === 'unknown'
      || node.evidence_mode !== 'live-observation')
      ? 'unknown'
      : 'healthy'
  return value.overall_status === expectedOverall
    && value.summary.node_count === nodes.length
    && value.summary.edge_count === edges.length
    && value.summary.healthy_count === counts[0]
    && value.summary.attention_count === counts[1]
    && value.summary.unknown_count === counts[2]
    && value.summary.observed_count === counts[3]
}

export function isFreshNetworkTopologyDocument(
  value: unknown,
  now: number | Date = Date.now(),
  maxAgeSeconds?: number
): value is NetworkTopologyDocument {
  return isNetworkTopologyDocument(value)
    && isFreshProjection(value.generated_at, now, maxAgeSeconds)
}

function evidenceMatchesStatus(
  value: NetworkTopologyNode | NetworkTopologyEdge
): boolean {
  return (value.evidence_mode !== 'not-connected' || value.status === 'unknown')
    && (value.status !== 'observed'
      || value.evidence_mode === 'live-observation')
}

function projectionMatchesEvidence(
  document: NetworkTopologyDocument,
  nodes: NetworkTopologyNode[],
  edges: NetworkTopologyEdge[]
): boolean {
  const allLive = [...nodes, ...edges]
    .every(item => item.evidence_mode === 'live-observation')
  if (document.projection_mode === 'live-local') return allLive
  if (document.projection_mode === 'mixed-local-and-declared') return !allLive
  return !allLive && document.overall_status === 'unknown'
}
