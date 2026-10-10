/**
 * Product-neutral projection types are the public package boundary; consumers
 * provide descriptors and retain ownership of discovery and authorization.
 */
export interface ResourceOwnerOrganization {
  id: string
  name: string
}

export interface ResourceAccountability {
  primary_department_id: string
  primary_team_id: string
  label: string
}

export interface ResourceReadiness {
  status: string
  managed_repository_count: number
  ready_repository_count: number
  linkage_attention_count: number
}

export interface ResourceCheck {
  name: string
  status: string
}

export interface ManagedRepositoryReadiness {
  status: string
  exists: boolean
  identity_valid: boolean
  git_initialized: boolean
  manifest_valid: boolean
  package_count: number
  finding_codes: string[]
}

export interface ManagedRepositoryObservation {
  mode: string
  observed_at_unix_seconds: number
  dirty_entry_count: number | null
  ready: boolean
  content_read: false
  external_actions: false
}

export interface ManagedRepository {
  id: string
  name: string
  /** Operating custody; this is independent from source hosting. */
  organization_id: string
  /** Registered source-host organization, or null when no separate host is declared. */
  source_organization_id: string | null
  /** Classified local placement such as ecosystem-provider or client-organization. */
  placement_scope: string
  lifecycle: string
  kind: string
  visibility: string
  package_name: string
  checks: ResourceCheck[]
  readiness: ManagedRepositoryReadiness
  observation: ManagedRepositoryObservation | null
}

export interface ResourceLinkage {
  id: string
  name: string
  other_resource_id: string
  other_resource_name: string
  relationship: string
  interface_kind: string
  operation_mode: string
  configuration_status: string
  contract_status: string
  machine_status: string
  human_review_status: string
  overall_status: string
  external_actions: false
}

export interface ManagedResource {
  id: string
  name: string
  summary: string
  resource_kind: string
  category: string
  exposure: string
  status: string
  owner_organization: ResourceOwnerOrganization
  accountability: ResourceAccountability
  readiness: ResourceReadiness
  repositories: ManagedRepository[]
  incoming_linkages: ResourceLinkage[]
  outgoing_linkages: ResourceLinkage[]
}

export interface ManagedResourcesDocument {
  schema: 'nuxtjp://managed-resources/list/v1'
  mode: string
  observed_at_unix_seconds: number
  external_actions: false
  healthy: boolean
  resource_count: number
  resources: ManagedResource[]
}

export interface ManagedResourceDetailDocument {
  schema: 'nuxtjp://managed-resources/detail/v1'
  mode: string
  observed_at_unix_seconds: number
  external_actions: false
  resource: ManagedResource
}

export interface ManagedResourcesSummary {
  resourceCount: number
  readyResourceCount: number
  repositoryCount: number
  readyRepositoryCount: number
  linkageCount: number
  attentionCount: number
}
