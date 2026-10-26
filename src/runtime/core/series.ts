/** Presentation values only. Query, scope, timezone and completeness belong to the caller. */
export interface NuxtJpSeriesPoint { id: string; label: string; value: number }
export type NuxtJpSeriesKind = 'bar' | 'line'
export function nuxtJpSeriesState(points: readonly NuxtJpSeriesPoint[]): 'ready' | 'empty' | 'invalid' {
  if (!Array.isArray(points) || points.length > 1000) return 'invalid'
  const ids = new Set<string>()
  for (const point of points) {
    if (!point || typeof point.id !== 'string' || !point.id || point.id.length > 256
      || ids.has(point.id) || typeof point.label !== 'string' || point.label.length > 200
      || typeof point.value !== 'number' || !Number.isFinite(point.value)) return 'invalid'
    ids.add(point.id)
  }
  return points.length ? 'ready' : 'empty'
}
