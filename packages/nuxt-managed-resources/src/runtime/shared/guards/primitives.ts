export type JsonRecord = Record<string, unknown>

export const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const isString = (value: unknown): value is string =>
  typeof value === 'string'

export const isText = (value: unknown): value is string =>
  isString(value) && value.length > 0

export const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0

export const isBoolean = (value: unknown): value is boolean =>
  typeof value === 'boolean'

export const isTextArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isText)

/** Rejects projection drift instead of silently accepting unreviewed fields. */
export function hasExactKeys(
  record: JsonRecord,
  keys: readonly string[]
): boolean {
  const actual = Object.keys(record).sort()
  const expected = [...keys].sort()
  return actual.length === expected.length
    && actual.every((key, index) => key === expected[index])
}
