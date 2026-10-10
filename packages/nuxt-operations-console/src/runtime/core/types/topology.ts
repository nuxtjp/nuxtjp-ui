export const NETWORK_TOPOLOGY_SCHEMA =
  'nuxtjp://operations/network-topology/v1' as const

export type TopologyStatus = 'healthy' | 'attention' | 'unknown' | 'observed'
export type TopologyEvidenceMode =
  'live-observation' | 'declared' | 'not-connected'

export interface NetworkTopologyMetrics {
  project_count: number
  network_count: number
  instance_count: number
}

export interface NetworkTopologyNode {
  id: string
  label: string
  kind: 'observer' | 'boundary-monitor' | 'interface' | 'environment'
  zone: string
  status: TopologyStatus
  source: string
  evidence_mode: TopologyEvidenceMode
  isolation_mode: string | null
  finding_codes: string[]
  column: number
  row: number
  metrics: NetworkTopologyMetrics
}

export interface NetworkTopologyEdge {
  id: string
  source_node_id: string
  target_node_id: string
  relation: 'observes'
  status: TopologyStatus
  evidence_mode: TopologyEvidenceMode
}

export interface NetworkTopologySummary {
  node_count: number
  edge_count: number
  healthy_count: number
  attention_count: number
  unknown_count: number
  observed_count: number
}

export interface NetworkTopologyDocument {
  schema: typeof NETWORK_TOPOLOGY_SCHEMA
  generated_at: string
  external_actions: false
  projection_mode: 'live-local' | 'mixed-local-and-declared' | 'simulation'
  overall_status: 'healthy' | 'attention' | 'unknown'
  summary: NetworkTopologySummary
  nodes: NetworkTopologyNode[]
  edges: NetworkTopologyEdge[]
}
