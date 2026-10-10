import type {
  ManagedResourcesSummary,
  ManagedResource
} from './types'

export interface ManagedResourcesFilters {
  query?: string
  organizationId?: string
  readiness?: string
}

export function filterResources(
  resources: readonly ManagedResource[],
  filters: ManagedResourcesFilters
): ManagedResource[] {
  const query = filters.query?.trim().toLocaleLowerCase('ja-JP') || ''
  return resources.filter((resource) => {
    const matchesQuery = !query || [
      resource.id,
      resource.name,
      resource.summary,
      resource.category,
      resource.owner_organization.name,
      ...resource.repositories.flatMap(repository => [
        repository.id,
        repository.name,
        repository.package_name
      ])
    ].some(value => value.toLocaleLowerCase('ja-JP').includes(query))
    const matchesOrganization = !filters.organizationId
      || resource.owner_organization.id === filters.organizationId
    const matchesReadiness = !filters.readiness
      || resource.readiness.status === filters.readiness
    return matchesQuery && matchesOrganization && matchesReadiness
  })
}

export function summarizeResources(resources: readonly ManagedResource[]): ManagedResourcesSummary {
  const repositories = resources.flatMap(resource => resource.repositories)
  const allLinkages = resources.flatMap(resource => [
    ...resource.incoming_linkages,
    ...resource.outgoing_linkages
  ])
  const linkages = new Set(allLinkages.map(linkage => linkage.id))
  const attentionLinkages = new Set(
    allLinkages
      .filter(linkage => linkage.overall_status === 'attention')
      .map(linkage => linkage.id)
  )
  return {
    resourceCount: resources.length,
    readyResourceCount: resources.filter(
      resource => resource.readiness.status === 'ready'
    ).length,
    repositoryCount: repositories.length,
    readyRepositoryCount: repositories.filter(
      repository => repository.readiness.status === 'ready'
    ).length,
    linkageCount: linkages.size,
    attentionCount: attentionLinkages.size
  }
}

export function statusTone(status: string): 'positive' | 'warning' | 'neutral' {
  if (['ready', 'healthy', 'verified', 'active', 'passed', 'ok'].includes(status)) {
    return 'positive'
  }
  if (['attention', 'invalid', 'blocked', 'failed', 'missing'].includes(status)) {
    return 'warning'
  }
  return 'neutral'
}
