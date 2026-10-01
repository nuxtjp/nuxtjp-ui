export interface NuxtJpHierarchyNode {
  id: string
  label: string
  description: string | null
  nodeType: string
  semanticIcon: string
  iconName: string
  iconSource: string
  badges: string[]
  attributes: Array<{ label: string, value: string }>
  searchTerms: string[]
  facetValues: Record<string, string[]>
  children: NuxtJpHierarchyNode[]
}

export interface NuxtJpHierarchyFacet {
  id: string
  label: string
  options: Array<{ label: string, value: string }>
}

export interface NuxtJpHierarchyRelation {
  id: string
  sourceId: string
  targetId: string
  kind: string
  label: string
}

export function filterHierarchy(nodes: NuxtJpHierarchyNode[], query = '',
  facets: Record<string, string> = {}): NuxtJpHierarchyNode[] {
  const normalized = query.trim().toLocaleLowerCase()
  const selections = Object.entries(facets).filter(([, value]) => value)
  return nodes.flatMap((node) => {
    const children = filterHierarchy(node.children ?? [], query, facets)
    const text = [node.label, node.description, ...(node.searchTerms ?? [])].filter(Boolean)
    const textMatch = !normalized || text.some(value => value!.toLocaleLowerCase().includes(normalized))
    const facetMatch = selections.every(([id, value]) => (node.facetValues?.[id] ?? []).includes(value))
    return (textMatch && facetMatch) || children.length ? [{ ...node, children }] : []
  })
}

export function flattenHierarchy(nodes: NuxtJpHierarchyNode[], expanded = new Set<string>(),
  forceOpen = false, depth = 1): Array<{ node: NuxtJpHierarchyNode, depth: number, branch: boolean }> {
  return nodes.flatMap((node) => {
    const branch = (node.children?.length ?? 0) > 0
    const row = { node, depth, branch }
    return branch && (forceOpen || expanded.has(node.id))
      ? [row, ...flattenHierarchy(node.children, expanded, forceOpen, depth + 1)] : [row]
  })
}

export function countHierarchy(nodes: NuxtJpHierarchyNode[]): number {
  return nodes.reduce((total, node) => total + 1 + countHierarchy(node.children ?? []), 0)
}

export function hierarchyRelations(nodes: NuxtJpHierarchyNode[],
  explicit: NuxtJpHierarchyRelation[] = []): NuxtJpHierarchyRelation[] {
  const known = new Set(flattenHierarchy(nodes, new Set(), true).map(row => row.node.id))
  const nested = nodes.flatMap(node => childRelations(node))
  return [...nested, ...explicit.filter(relation => known.has(relation.sourceId)
    && known.has(relation.targetId))]
}

export function hierarchyActivation(relations: NuxtJpHierarchyRelation[], selectedId: string | null) {
  if (!selectedId) return { nodeIds: new Set<string>(), relationIds: new Set<string>() }
  const adjacent = relations.filter(relation => relation.sourceId === selectedId
    || relation.targetId === selectedId)
  return { nodeIds: new Set([selectedId, ...adjacent.flatMap(relation =>
    [relation.sourceId, relation.targetId])]), relationIds: new Set(adjacent.map(relation => relation.id)) }
}

function childRelations(parent: NuxtJpHierarchyNode): NuxtJpHierarchyRelation[] {
  return (parent.children ?? []).flatMap(child => [{ id: `contains:${parent.id}:${child.id}`,
    sourceId: parent.id, targetId: child.id, kind: 'contains', label: '含む' }, ...childRelations(child)])
}
