import { describe, expect, it } from 'vitest'
import { managementNavigation, resolveManagementLayoutConfig } from '../core'

const routes = [
  route('topology', 'Topology', '/topology'),
  { ...route('detail', 'Node detail', '/topology/:id'), match: 'segments' as const,
    parentId: 'topology' },
  { ...route('assets', 'Assets', '/topology/assets'), parentId: 'topology' },
  { ...route('history', 'History', '/topology/assets/history'), parentId: 'assets' },
  { ...route('audit', 'Audit', '/topology/assets/history/audit'), parentId: 'history' }
]
const config = resolveManagementLayoutConfig({
  brand: { name: 'Example', mark: 'E', home: '/topology' }, routes,
  navigation: [{ id: 'general', label: 'General', routeIds: ['topology'] }]
})

describe('static navigation hierarchy', () => {
  it('renders concrete child routes to three levels and omits detail templates', () => {
    const navigation = managementNavigation(config, '/topology/assets/history')
    const topology = navigation.find(entry => 'to' in entry && entry.to === '/topology')
    expect(topology).toMatchObject({ active: true, defaultOpen: true, children: [{
      label: 'Assets', active: true, children: [{ label: 'History', active: true }]
    }] })
    expect(JSON.stringify(topology)).not.toContain('Node detail')
    expect(JSON.stringify(topology)).not.toContain('Audit')
  })

  it('does not duplicate a dynamic item whose target is a static child route', () => {
    const navigation = managementNavigation(config, '/topology/assets', [{
      groupId: 'general', parentRouteId: 'topology', items: [{
        id: 'hat-assets', label: 'Assets HAT', title: 'Assets HAT', to: '/topology/assets'
      }]
    }])
    const topology = navigation.find(entry => 'to' in entry && entry.to === '/topology')
    expect(topology && 'children' in topology
      ? topology.children?.filter(child => child.to === '/topology/assets') : []).toHaveLength(1)
  })
})

function route(id: string, label: string, path: string) {
  return { id, label, title: label, path, match: 'exact' as const }
}
