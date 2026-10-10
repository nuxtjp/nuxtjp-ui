import type { ManagementNavigationGroup } from './config'

export interface ManagementNavigationLink {
  label: string
  title: string
  icon?: string
  to: string
  active: boolean
  defaultOpen?: boolean
  children?: ManagementNavigationLink[]
}

export interface ManagementDynamicNavigationItem {
  id: string
  label: string
  title: string
  icon?: string
  to: string
  children?: ManagementDynamicNavigationItem[]
}

export interface ManagementDynamicNavigationGroup {
  groupId: string
  parentRouteId?: string
  items: ManagementDynamicNavigationItem[]
}

export function dynamicLink(item: ManagementDynamicNavigationItem,
  currentLocation: string): ManagementNavigationLink {
  const children = item.children?.map(child => dynamicLink(child, currentLocation))
  const active = locationMatches(item.to, currentLocation)
    || Boolean(children?.some(child => child.active))
  return { label: item.label, title: item.title, icon: item.icon, to: item.to,
    active, ...(active && children?.length ? { defaultOpen: true } : {}),
    ...(children?.length ? { children } : {}) }
}

export function validateDynamicGroups(navigation: readonly ManagementNavigationGroup[],
  groups: readonly ManagementDynamicNavigationGroup[]) {
  if (!Array.isArray(groups) || groups.length > navigation.length) invalid()
  const known = new Set(navigation.map(group => group.id)), groupIds = new Set<string>()
  const itemIds = new Set<string>()
  let total = 0
  for (const group of groups) {
    if (!known.has(group.groupId) || groupIds.has(group.groupId)
      || !Array.isArray(group.items) || group.items.length > 64) invalid()
    const owner = navigation.find(value => value.id === group.groupId)
    if (group.parentRouteId !== undefined
      && !owner?.routeIds.includes(group.parentRouteId)) invalid()
    groupIds.add(group.groupId)
    for (const item of group.items) {
      total += validateItem(item, itemIds, true)
      if (total > 128) invalid()
    }
  }
}

function validateItem(item: ManagementDynamicNavigationItem,
  ids: Set<string>, allowChildren: boolean): number {
  if (!identifier(item?.id) || ids.has(item.id) || !bounded(item.label, 512)
    || !bounded(item.title, 512) || !internalLocation(item.to)
    || (item.icon !== undefined && !/^i-[a-z0-9-]{1,100}$/u.test(item.icon))) invalid()
  ids.add(item.id)
  if (item.children === undefined) return 1
  if (!allowChildren || !Array.isArray(item.children) || item.children.length > 64) invalid()
  return 1 + item.children.reduce((sum, child) =>
    sum + validateItem(child, ids, false), 0)
}

function locationMatches(target: string, current: string) {
  const withoutHash = current.split('#')[0] ?? current
  if (target.includes('?')) return target === withoutHash
  return path(target) === path(withoutHash)
}

function path(value: string) {
  const result = value.split('?')[0] || '/'
  return result.length > 1 ? result.replace(/\/+$/u, '') : result
}
function internalLocation(value: unknown) {
  if (typeof value !== 'string' || value.length > 1024 || !value.startsWith('/')
    || value.startsWith('//') || /[\\\u0000-\u001F\u007F#]/u.test(value)) return false
  try { const parsed = new URL(value, 'https://management.invalid')
    return parsed.origin === 'https://management.invalid' && !parsed.username && !parsed.password
  } catch { return false }
}
function identifier(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,63}$/u.test(value)
}
function bounded(value: unknown, maximum: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maximum
}
function invalid(): never { throw new Error('management dynamic navigation is invalid') }
