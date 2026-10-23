export type Probe = { type: 'contains-text' | 'github-head' | 'github-release', url: string, expected: string }
export type Source = {
  id: string, reviewRequired: boolean, probes: Probe[], status: string, notes?: string,
  observedVersion?: string, consumedVersion?: string, compatibilityVersion?: string
}
export type SourceLock = {
  schemaVersion: number, reviewPolicy: string, sources: Source[],
  implementationBaseline: { version: string, checkedAt: string, componentCount: number }
}
export type Requirement = {
  id: string, title: string, sourceId: string, sourceUrl: string, section: string,
  status: string, localLevel: string, artifacts?: string[], tests?: string[],
  evidence?: string[], exceptionReason?: string
}
export type Catalog = { name: string, data: { requirements: Requirement[] } }
export type Component = {
  id: string, profile: string, status: string, requirementIds: string[], localComponent: string | null
}
export type Coverage = { sourceVersion: string, checkedAt: string, components: Component[] }
