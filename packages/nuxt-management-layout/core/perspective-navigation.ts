import type {
  ManagementNavigationGroup, ManagementRouteDefinition, ResolvedManagementLayoutConfig
} from './config'
import type { ManagementDynamicNavigationGroup } from './dynamic-navigation'
import {
  managementNavigation, managementRouteFor, type ManagementNavigationItem
} from './navigation'

export function managementPerspectiveFor(
  config: Pick<ResolvedManagementLayoutConfig, 'routes' | 'navigation' | 'perspectives'>,
  path: string
) {
  if (!config.perspectives.length) return undefined
  const current = managementRouteFor(config.routes, path)
  const group = current && owningNavigationGroup(config.routes, config.navigation, current)
  return config.perspectives.find(value => group
    && value.navigationGroupIds.includes(group.id)) ?? config.perspectives[0]
}

export function managementPerspectiveNavigation(
  config: Pick<ResolvedManagementLayoutConfig, 'routes' | 'navigation' | 'perspectives'>,
  path: string,
  dynamicGroups: readonly ManagementDynamicNavigationGroup[] = []
): ManagementNavigationItem[] {
  const perspective = managementPerspectiveFor(config, path)
  if (!perspective) return managementNavigation(config, path, dynamicGroups)
  const groups = config.navigation.filter(group =>
    perspective.navigationGroupIds.includes(group.id))
  const groupIds = new Set(groups.map(group => group.id))
  return managementNavigation({ routes: config.routes, navigation: groups }, path,
    dynamicGroups.filter(group => groupIds.has(group.groupId)))
}

function owningNavigationGroup(
  routes: readonly ManagementRouteDefinition[],
  navigation: readonly ManagementNavigationGroup[],
  current: ManagementRouteDefinition
) {
  const seen = new Set<string>()
  let route: ManagementRouteDefinition | undefined = current
  while (route && !seen.has(route.id)) {
    const group = navigation.find(value => value.routeIds.includes(route!.id))
    if (group) return group
    seen.add(route.id)
    route = route.parentId ? routes.find(item => item.id === route?.parentId) : undefined
  }
  return undefined
}
