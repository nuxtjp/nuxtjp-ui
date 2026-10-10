import { describe, expect, it } from 'vitest'
import type { NuxtJpManagementLayoutConfig } from '../core'
import {
  managementBreadcrumbs, managementNavigation, managementPerspectiveFor,
  managementPerspectiveNavigation, managementRouteFor,
  normalizeManagementPath, resolveManagementLayoutConfig
} from '../core'

const config: NuxtJpManagementLayoutConfig = {
  brand: { name: 'Example', mark: 'E', home: '/' },
  routes: [
    item('overview', 'Overview', '/', 'exact'),
    item('topology', 'Topology', '/topology', 'exact'),
    { ...item('node', 'Node detail', '/topology/:id', 'segments'), parentId: 'topology' },
    item('fallback', 'Fallback', '/fallback', 'prefix')
  ],
  navigation: [{
    id: 'general', label: 'General', routeIds: ['overview', 'topology', 'fallback']
  }]
}
const resolved = resolveManagementLayoutConfig(config)

describe('management navigation presentation', () => {
  it('selects detail routes and parent breadcrumbs', () => {
    expect(managementRouteFor(resolved.routes, '/topology/node-1')?.id).toBe('node')
    expect(managementRouteFor(resolved.routes, '/topology/node-1/extra')).toBeUndefined()
    expect(managementBreadcrumbs(resolved.routes, '/topology/node-1')).toEqual([
      { label: 'Topology', to: '/topology' },
      { label: 'Node detail', to: undefined }
    ])
  })

  it('activates the owning route and normalizes browser suffixes', () => {
    const active = managementNavigation(resolved, '/topology/node-1')
      .filter(entry => 'active' in entry && entry.active)
    expect(active).toEqual([expect.objectContaining({ to: '/topology' })])
    expect(normalizeManagementPath('/topology/node-1/?view=detail#status'))
      .toBe('/topology/node-1')
  })

  it('adds bounded two-level dynamic entries to an existing group', () => {
    const value = managementNavigation(resolved, '/operations?hat=accounting', [{
      groupId: 'general', items: [{ id: 'hat-accounting', label: '会計HAT',
        title: '会計HAT', to: '/operations?hat=accounting', children: [{
          id: 'hat-accounting-import', label: '取引を取り込む', title: '取引を取り込む',
          to: '/operations?hat=accounting&operation=import' }] }]
    }])
    const parent = value.find(item => 'to' in item && item.to === '/operations?hat=accounting')
    expect(parent).toMatchObject({ label: '会計HAT', active: true,
      children: [expect.objectContaining({ label: '取引を取り込む', active: false })] })
  })

  it('attaches dynamic entries below one declared static route', () => {
    const value = managementNavigation(resolved, '/operations?hat=accounting', [{
      groupId: 'general', parentRouteId: 'topology', items: [{
        id: 'hat-accounting', label: '会計HAT', title: '会計HAT',
        to: '/operations?hat=accounting', children: [{
          id: 'hat-accounting-import', label: '取引を取り込む', title: '取引を取り込む',
          to: '/operations?hat=accounting&operation=import' }] }]
    }])
    const parent = value.find(item => 'to' in item && item.to === '/topology')
    expect(parent).toMatchObject({ label: 'Topology', active: true,
      children: [expect.objectContaining({ label: '会計HAT', active: true })] })
    expect(value.some(item => 'to' in item && item.to === '/operations?hat=accounting')).toBe(false)
  })

  it('rejects paths, unknown groups, duplicate IDs and a third dynamic level', () => {
    const base = { groupId: 'general', items: [{ id: 'hat', label: 'HAT', title: 'HAT',
      to: '/operations' }] }
    expect(() => managementNavigation(resolved, '/', [{ ...base, groupId: 'unknown' }]))
      .toThrow('dynamic navigation')
    expect(() => managementNavigation(resolved, '/', [{ ...base,
      parentRouteId: 'node' }])).toThrow('dynamic navigation')
    expect(() => managementNavigation(resolved, '/', [{ ...base,
      items: [{ ...base.items[0]!, to: 'https://example.com' }] }])).toThrow('dynamic navigation')
    expect(() => managementNavigation(resolved, '/', [{ ...base,
      items: [base.items[0]!, base.items[0]!] }])).toThrow('dynamic navigation')
    expect(() => managementNavigation(resolved, '/', [{ ...base, items: [{ ...base.items[0]!,
      children: [{ id: 'child', label: 'Child', title: 'Child', to: '/operations',
        children: [{ id: 'third', label: 'Third', title: 'Third', to: '/' }] }] }] }]))
      .toThrow('dynamic navigation')
  })

  it('keeps a bounded wire identifier as the exact menu label', () => {
    const operationId = '\\'.repeat(512)
    const value = managementNavigation(resolved, '/', [{ groupId: 'general', items: [{
      id: 'operation-long', label: operationId, title: operationId, to: '/operations'
    }] }])
    expect(value.find(item => 'to' in item && item.to === '/operations'))
      .toMatchObject({ label: operationId, title: operationId })
    expect(() => managementNavigation(resolved, '/', [{ groupId: 'general', items: [{
      id: 'operation-too-long', label: `${operationId}x`, title: operationId, to: '/operations'
    }] }])).toThrow('dynamic navigation')
  })

  it('selects one route-owned perspective and hides other navigation groups', () => {
    const value = resolveManagementLayoutConfig({
      ...config,
      routes: [...config.routes,
        { ...item('branch', 'Branch', '/branch', 'exact'), parentId: 'topology' },
        { ...item('leaf', 'Leaf detail', '/topology/:id/leaf', 'segments'),
          parentId: 'branch' }],
      navigation: [
        { id: 'foundation', label: 'Foundation', routeIds: ['overview', 'branch'] },
        { id: 'work', label: 'Work', routeIds: ['topology', 'fallback'] }
      ],
      perspectives: [
        { id: 'foundation', label: '基盤', description: '基本情報', home: '/',
          navigationGroupIds: ['foundation'] },
        { id: 'work', label: '仕事', description: '作業と予実', home: '/topology',
          navigationGroupIds: ['work'] }
      ]
    })
    expect(managementPerspectiveFor(value, '/topology/node-1')?.id).toBe('work')
    expect(managementPerspectiveFor(value, '/topology/node-1/leaf')?.id).toBe('foundation')
    const navigation = managementPerspectiveNavigation(value, '/topology/node-1')
    expect(navigation).toContainEqual({ type: 'label', label: 'Work' })
    expect(navigation).not.toContainEqual({ type: 'label', label: 'Foundation' })
  })
})

function item(
  id: string, label: string, path: string,
  match: 'exact' | 'prefix' | 'segments'
) {
  return { id, label, title: label, path, match }
}
