import type {
  ManagementNavigationGroup,
  ManagementRouteDefinition,
  ResolvedManagementLayoutConfig
} from './config'
import {
  dynamicLink, validateDynamicGroups,
  type ManagementDynamicNavigationGroup,
  type ManagementDynamicNavigationItem,
  type ManagementNavigationLink
} from './dynamic-navigation'

export interface ManagementBreadcrumbItem { label: string, to?: string }
export type ManagementNavigationItem =
  | { type: 'label', label: string }
  | ManagementNavigationLink

export function managementRouteFor(
  routes: readonly ManagementRouteDefinition[], path: string
) {
  const normalized = normalizeManagementPath(path)
  return routes.filter(route => routeMatches(route, normalized))
    .sort((left, right) => matchScore(right) - matchScore(left))[0]
}

export function managementBreadcrumbs(
  routes: readonly ManagementRouteDefinition[], path: string
): ManagementBreadcrumbItem[] {
  const current = managementRouteFor(routes, path)
  if (!current) return []
  const chain: ManagementRouteDefinition[] = []
  const seen = new Set<string>()
  let route: ManagementRouteDefinition | undefined = current
  while (route && !seen.has(route.id)) {
    chain.unshift(route)
    seen.add(route.id)
    route = route.parentId ? routes.find(item => item.id === route?.parentId) : undefined
  }
  return chain.map((item, index) => ({
    label: item.label,
    to: index === chain.length - 1 || item.path.includes(':') ? undefined : item.path
  }))
}

export function managementNavigation(
  config: Pick<ResolvedManagementLayoutConfig, 'routes' | 'navigation'>,
  path: string,
  dynamicGroups: readonly ManagementDynamicNavigationGroup[] = []
): ManagementNavigationItem[] {
  const current = managementRouteFor(config.routes, path)
  validateDynamicGroups(config.navigation, dynamicGroups)
  return config.navigation.flatMap(group => groupEntries(group, config.routes, current,
    dynamicGroups.find(value => value.groupId === group.id), path))
}

export function normalizeManagementPath(value: string) {
  const path = value.split(/[?#]/u)[0] || '/'
  return path.length > 1 ? path.replace(/\/+$/u, '') : path
}

function groupEntries(
  group: ManagementNavigationGroup,
  routes: readonly ManagementRouteDefinition[],
  current: ManagementRouteDefinition | undefined,
  dynamicGroup: ManagementDynamicNavigationGroup | undefined,
  currentLocation: string
): ManagementNavigationItem[] {
  const dynamicItems = dynamicGroup?.items ?? []
  const rootIds = new Set(group.routeIds)
  return [
    { type: 'label', label: group.label },
    ...group.routeIds.map(id => {
      const route = routes.find(item => item.id === id)
      if (!route) throw new Error(`unknown management route: ${id}`)
      const link = staticLink(route, routes, current, rootIds, 1)
      if (dynamicGroup?.parentRouteId !== id) return link
      const targets = new Set<string>()
      collectTargets(link.children ?? [], targets)
      const dynamic = dynamicItems.map(item => dynamicLink(item, currentLocation))
        .filter(item => !targets.has(item.to))
      const children = [...(link.children ?? []), ...dynamic]
      const active = link.active || dynamic.some(child => child.active)
      return { ...link, active, ...(active && children.length ? { defaultOpen: true } : {}),
        ...(children.length ? { children } : {}) }
    }),
    ...(dynamicGroup?.parentRouteId ? []
      : dynamicItems.map(item => dynamicLink(item, currentLocation)))
  ]
}

function staticLink(
  route: ManagementRouteDefinition,
  routes: readonly ManagementRouteDefinition[],
  current: ManagementRouteDefinition | undefined,
  rootIds: ReadonlySet<string>,
  depth: number
): ManagementNavigationLink {
  const children = depth >= 3 ? [] : routes
    .filter(item => item.parentId === route.id && !item.path.includes(':')
      && !rootIds.has(item.id))
    .map(item => staticLink(item, routes, current, rootIds, depth + 1))
  const active = Boolean(current && belongsTo(routes, current, route.id))
    || children.some(child => child.active)
  return {
    label: route.label, title: route.title, icon: route.icon, to: route.path,
    active, ...(active && children.length ? { defaultOpen: true } : {}),
    ...(children.length ? { children } : {})
  }
}

function collectTargets(items: readonly ManagementNavigationLink[], targets: Set<string>) {
  for (const item of items) {
    targets.add(item.to)
    collectTargets(item.children ?? [], targets)
  }
}
function belongsTo(
  routes: readonly ManagementRouteDefinition[],
  current: ManagementRouteDefinition,
  ownerId: string
) {
  const seen = new Set<string>()
  let route: ManagementRouteDefinition | undefined = current
  while (route && !seen.has(route.id)) {
    if (route.id === ownerId) return true
    seen.add(route.id)
    route = route.parentId ? routes.find(item => item.id === route?.parentId) : undefined
  }
  return false
}

function routeMatches(route: ManagementRouteDefinition, path: string) {
  const pattern = normalizeManagementPath(route.path)
  if ((route.match ?? 'exact') === 'prefix') {
    return path === pattern || (pattern !== '/' && path.startsWith(`${pattern}/`))
  }
  if ((route.match ?? 'exact') === 'segments') {
    const expected = pattern.split('/').filter(Boolean), actual = path.split('/').filter(Boolean)
    return expected.length === actual.length && expected.every((part, index) =>
      part.startsWith(':') ? Boolean(actual[index]) : part === actual[index])
  }
  return path === pattern
}

function matchScore(route: ManagementRouteDefinition) {
  const rank = { exact: 3, segments: 2, prefix: 1 }[route.match ?? 'exact'],
    literal = route.path.split('/').filter(part => part && !part.startsWith(':')).length
  return rank * 10_000 + literal * 100 + route.path.length
}
