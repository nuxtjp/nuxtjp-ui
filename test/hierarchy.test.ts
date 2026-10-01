import { describe, expect, it } from 'vitest'
import { filterHierarchy, flattenHierarchy, hierarchyActivation,
  hierarchyRelations, type NuxtJpHierarchyNode } from '../src/runtime/core'

const leaf = (id: string, label = id): NuxtJpHierarchyNode => ({ id, label, description: null,
  nodeType: 'test', semanticIcon: 'concept', iconName: 'i-lucide-circle', iconSource: 'host',
  badges: [], attributes: [], searchTerms: [], facetValues: {}, children: [] })

describe('hierarchy projection primitives', () => {
  it('keeps matching descendants with their ancestors', () => {
    const nodes = [{ ...leaf('root'), children: [leaf('match', '検索対象')] }]
    const filtered = filterHierarchy(nodes, '検索')
    expect(filtered).toHaveLength(1)
    expect(filtered[0]?.children[0]?.id).toBe('match')
  })

  it('flattens only expanded branches unless filtering forces them open', () => {
    const nodes = [{ ...leaf('root'), children: [leaf('child')] }]
    expect(flattenHierarchy(nodes)).toHaveLength(1)
    expect(flattenHierarchy(nodes, new Set(['root']))).toHaveLength(2)
    expect(flattenHierarchy(nodes, new Set(), true)).toHaveLength(2)
  })

  it('derives containment relations and activates only adjacent nodes', () => {
    const nodes = [{ ...leaf('root'), children: [leaf('child')] }]
    const relations = hierarchyRelations(nodes)
    expect(relations).toHaveLength(1)
    expect([...hierarchyActivation(relations, 'root').nodeIds]).toEqual(['root', 'child'])
  })
})
