import type { ManagementRouteDefinition, NuxtJpManagementLayoutConfig } from './config'

export function validatePerspectives(
  value: NuxtJpManagementLayoutConfig,
  routes: ReadonlyMap<string, ManagementRouteDefinition>
) {
  if (value.perspectives === undefined) return
  if (!Array.isArray(value.perspectives) || value.perspectives.length < 2
    || value.perspectives.length > 8) invalid('must contain 2 to 8 entries')
  const groups = new Set(value.navigation.map(group => group.id))
  const ids = new Set<string>(), assigned = new Set<string>()
  for (const perspective of value.perspectives) {
    if (!identifier(perspective.id) || ids.has(perspective.id)
      || !bounded(perspective.label, 100) || !bounded(perspective.description, 240)
      || !absolutePath(perspective.home) || !perspective.navigationGroupIds.length) {
      invalid('is invalid')
    }
    if (![...routes.values()].some(route => route.path === perspective.home)) {
      invalid(`home is unknown: ${perspective.id}`)
    }
    ids.add(perspective.id)
    for (const groupId of perspective.navigationGroupIds) {
      if (!groups.has(groupId) || assigned.has(groupId)) {
        invalid(`group is invalid: ${groupId}`)
      }
      assigned.add(groupId)
    }
  }
  if (assigned.size !== groups.size) invalid('must include every navigation group')
}

function identifier(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,63}$/u.test(value)
}
function bounded(value: unknown, maximum: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maximum
}
function absolutePath(value: unknown): value is string {
  return typeof value === 'string' && /^\/(?:[A-Za-z0-9._~-]+\/)*[A-Za-z0-9._~-]*$/u.test(value)
}
function invalid(reason: string): never {
  throw new Error(`management perspective ${reason}`)
}
