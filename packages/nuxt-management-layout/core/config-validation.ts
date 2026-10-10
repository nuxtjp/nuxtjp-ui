import type {
  ManagementColor,
  ManagementRouteDefinition,
  NuxtJpManagementLayoutConfig
} from './config'
import { validatePerspectives } from './perspective-validation'

export function validateManagementLayoutConfig(value: NuxtJpManagementLayoutConfig): void {
  if (!value || !Array.isArray(value.routes) || !Array.isArray(value.navigation)) {
    throw new Error('nuxtJpManagementLayout configuration is invalid')
  }
  if (!bounded(value.brand?.name, 100) || !bounded(value.brand.mark, 10)
    || !absolutePath(value.brand.home)) {
    throw new Error('nuxtJpManagementLayout.brand is invalid')
  }
  const routes = new Map(value.routes.map(route => [route.id, route]))
  if (routes.size !== value.routes.length) throw new Error('management route IDs must be unique')
  const paths = new Set(value.routes.map(route => route.path))
  if (paths.size !== value.routes.length) throw new Error('management route paths must be unique')
  for (const route of value.routes) validateRoute(route, routes)
  validateParentChains(value.routes, routes)
  validateNavigation(value, routes)
  validatePerspectives(value, routes)
  validateOptions(value)
}

function validateNavigation(
  value: NuxtJpManagementLayoutConfig,
  routes: ReadonlyMap<string, ManagementRouteDefinition>
) {
  const groups = new Set<string>()
  const assignedRoutes = new Set<string>()
  for (const group of value.navigation) {
    if (!identifier(group.id) || groups.has(group.id)) {
      throw new Error('navigation group IDs must be unique and safe')
    }
    groups.add(group.id)
    if (!bounded(group.label, 100) || !group.routeIds.length) {
      throw new Error('navigation groups must be labelled')
    }
    for (const id of group.routeIds) {
      if (!routes.has(id)) throw new Error(`unknown navigation route: ${id}`)
      if (assignedRoutes.has(id)) throw new Error(`navigation route is assigned twice: ${id}`)
      assignedRoutes.add(id)
    }
  }
}

function validateOptions(value: NuxtJpManagementLayoutConfig) {
  const colors = new Set<ManagementColor>([
    'primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral'
  ])
  if (value.environment?.color && !colors.has(value.environment.color)) {
    throw new Error('management environment color is invalid')
  }
  if (value.contentWidth && !['wide', 'full'].includes(value.contentWidth)) {
    throw new Error('management content width is invalid')
  }
  if (value.perspectivePlacement
    && !['header', 'footer'].includes(value.perspectivePlacement)) {
    throw new Error('management perspective placement is invalid')
  }
  if (value.storageKey !== undefined && !/^[a-z0-9][a-z0-9._-]{2,79}$/u.test(value.storageKey)) {
    throw new Error('management storage key is invalid')
  }
  if (value.environment && !bounded(value.environment.label, 100)) {
    throw new Error('management environment label is invalid')
  }
  if (value.footer && !bounded(value.footer.label, 100)) {
    throw new Error('management footer label is invalid')
  }
}

function validateRoute(
  route: ManagementRouteDefinition,
  routes: ReadonlyMap<string, ManagementRouteDefinition>
) {
  if (!identifier(route.id) || !bounded(route.label, 100) || !bounded(route.title, 160)
    || !absolutePath(route.path)) {
    throw new Error(`management route is invalid: ${route.id || '(missing id)'}`)
  }
  if (route.parentId && (!routes.has(route.parentId) || route.parentId === route.id)) {
    throw new Error(`management route parent is invalid: ${route.id}`)
  }
  const segments = route.path.split('/').filter(Boolean)
  if (!['exact', 'prefix', 'segments'].includes(route.match ?? 'exact')) {
    throw new Error(`management route match is invalid: ${route.id}`)
  }
  if ((route.match ?? 'exact') !== 'segments' && segments.some(part => part.startsWith(':'))) {
    throw new Error(`management route parameters require segment matching: ${route.id}`)
  }
  if ((route.match ?? 'exact') === 'segments' && segments.some(part =>
    part.startsWith(':') && !/^:[A-Za-z][A-Za-z0-9_]*$/u.test(part))) {
    throw new Error(`management route parameter is invalid: ${route.id}`)
  }
}

function validateParentChains(
  routes: readonly ManagementRouteDefinition[],
  lookup: ReadonlyMap<string, ManagementRouteDefinition>
) {
  for (const route of routes) {
    const seen = new Set([route.id])
    let parentId = route.parentId
    while (parentId) {
      if (seen.has(parentId)) throw new Error(`management route parent cycle: ${route.id}`)
      seen.add(parentId)
      parentId = lookup.get(parentId)?.parentId
    }
  }
}

function absolutePath(value: string) {
  if (typeof value !== 'string' || value.length > 512
    || !value.startsWith('/') || value.startsWith('//')) return false
  if (/[\\?#\u0000-\u001F\u007F]/u.test(value)) return false
  if (value === '/') return true
  return value.split('/').slice(1)
    .every(segment => segment.length > 0 && segment !== '.' && segment !== '..')
}

function identifier(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,63}$/u.test(value)
}

function bounded(value: unknown, maximum: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maximum
}
