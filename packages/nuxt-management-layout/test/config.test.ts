import { describe, expect, it } from 'vitest'
import type { NuxtJpManagementLayoutConfig } from '../core'
import { resolveManagementLayoutConfig, validateManagementLayoutConfig } from '../core'

const valid = (): NuxtJpManagementLayoutConfig => ({
  brand: { name: 'Example', mark: 'E', home: '/' },
  routes: [
    route('overview', '/'), route('topology', '/topology'),
    { ...route('detail', '/topology/:id'), match: 'segments', parentId: 'topology' }
  ],
  navigation: [{ id: 'general', label: 'General', routeIds: ['overview', 'topology'] }]
})

describe('management layout configuration', () => {
  it('resolves defaults without mutating declarations', () => {
    const source = valid()
    const result = resolveManagementLayoutConfig(source)
    expect(result.contentWidth).toBe('wide')
    expect(result.perspectivePlacement).toBe('header')
    expect(result.routes[0]?.match).toBe('exact')
    expect(result.navigation[0]?.routeIds).not.toBe(source.navigation[0]?.routeIds)
  })

  it.each([
    '/double//segment', '/back\\slash', '/relative/../escape',
    '/relative/./same', '/query?value=1', '/fragment#value', '//authority'
  ])('rejects unsafe route path %s', path => {
    const source = valid()
    source.routes[0]!.path = path
    expect(() => validateManagementLayoutConfig(source)).toThrow(/route is invalid/u)
  })

  it('rejects invalid parents and duplicate navigation assignment', () => {
    const cycle = valid()
    cycle.routes[1]!.parentId = 'detail'
    expect(() => validateManagementLayoutConfig(cycle)).toThrow(/parent cycle/u)
    const duplicate = valid()
    duplicate.navigation.push({ id: 'other', label: 'Other', routeIds: ['topology'] })
    expect(() => validateManagementLayoutConfig(duplicate)).toThrow(/assigned twice/u)
  })

  it('rejects duplicate paths and unsafe identifiers', () => {
    const paths = valid()
    paths.routes[1]!.path = '/'
    expect(() => validateManagementLayoutConfig(paths)).toThrow(/paths must be unique/u)
    const identifier = valid()
    identifier.routes[0]!.id = '../overview'
    expect(() => validateManagementLayoutConfig(identifier)).toThrow(/route is invalid/u)
  })

  it('rejects invalid option values', () => {
    const storage = valid()
    storage.storageKey = '../unsafe'
    expect(() => validateManagementLayoutConfig(storage)).toThrow(/storage key/u)
    const environment = valid()
    environment.environment = { label: '', color: 'neutral' }
    expect(() => validateManagementLayoutConfig(environment)).toThrow(/environment label/u)
  })

  it('requires perspectives to partition every navigation group exactly once', () => {
    const source = valid()
    source.navigation = [
      { id: 'foundation', label: 'Foundation', routeIds: ['overview'] },
      { id: 'work', label: 'Work', routeIds: ['topology'] }
    ]
    source.perspectives = [
      { id: 'foundation', label: '基盤', description: '基本情報', home: '/',
        navigationGroupIds: ['foundation'] },
      { id: 'work', label: '仕事', description: '作業と予実', home: '/topology',
        navigationGroupIds: ['work'] }
    ]
    const result = resolveManagementLayoutConfig(source)
    expect(result.perspectives.map(value => value.id)).toEqual(['foundation', 'work'])
    source.perspectivePlacement = 'footer'
    expect(resolveManagementLayoutConfig(source).perspectivePlacement).toBe('footer')
    source.perspectives[1]!.navigationGroupIds = ['foundation']
    expect(() => validateManagementLayoutConfig(source)).toThrow(/perspective group/u)
  })
})

function route(id: string, path: string) {
  return { id, path, label: id, title: id }
}
