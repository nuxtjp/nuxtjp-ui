export const DEFAULT_MAX_AGE_SECONDS = 300

function toMilliseconds(value: string | number): number {
  return typeof value === 'number' ? value * 1000 : Date.parse(value)
}

export function isFreshProjection(
  generatedAt: string | number,
  now: number | Date = Date.now(),
  maxAgeSeconds = DEFAULT_MAX_AGE_SECONDS
): boolean {
  const instant = toMilliseconds(generatedAt)
  const evaluatedAt = now instanceof Date ? now.getTime() : now
  const age = evaluatedAt - instant
  return Number.isFinite(instant)
    && Number.isFinite(evaluatedAt)
    && age >= -60_000
    && age <= maxAgeSeconds * 1000
}

export function isFuture(
  value: string | number | null,
  now: number | Date
): boolean {
  if (value === null) return true
  const evaluatedAt = now instanceof Date ? now.getTime() : now
  return toMilliseconds(value) > evaluatedAt
}
