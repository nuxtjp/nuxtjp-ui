export type UnknownRecord = Record<string, unknown>

export const MAX_DOCUMENT_ITEMS = 1024
export const MAX_CONTROL_ITEMS = 256
export const MAX_FINDING_CODES = 64

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function hasExactKeys(value: UnknownRecord, keys: readonly string[]): boolean {
  const actual = Object.keys(value)
  return actual.length === keys.length && actual.every(key => keys.includes(key))
}

export function isString(value: unknown, maxLength = 256): value is string {
  return typeof value === 'string'
    && value.length > 0
    && [...value].length <= maxLength
}

export function isSafeDisplayText(value: unknown, maxLength = 128): value is string {
  return isString(value, maxLength)
    && !/[\u0000-\u001f\u007f-\u009f\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/u.test(value)
}

export function isTimestamp(value: unknown): value is string {
  if (!isString(value, 24)
    || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value)) return false
  const parsed = new Date(value)
  return Number.isFinite(parsed.getTime()) && parsed.toISOString() === value
}

export function isFiniteNumber(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number'
    && Number.isFinite(value)
    && value >= min
    && value <= max
}

export function isNullableNumber(
  value: unknown,
  min: number,
  max: number
): value is number | null {
  return value === null || isFiniteNumber(value, min, max)
}

export function isCount(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0
}

export function isUnixSeconds(value: unknown): value is number {
  return isCount(value) && value <= 253_402_300_799
}

export function isNullableUnixSeconds(value: unknown): value is number | null {
  return value === null || isUnixSeconds(value)
}

export function isIdentifier(value: unknown, maxLength = 128): value is string {
  return typeof value === 'string'
    && value.length <= maxLength
    && /^[a-z0-9][a-z0-9._-]*$/u.test(value)
}

export function isLetterIdentifier(value: unknown, maxLength = 256): value is string {
  return typeof value === 'string'
    && value.length <= maxLength
    && /^[a-z][a-z0-9._-]*$/u.test(value)
}

export function isUniqueIdentifierArray(value: unknown): value is string[] {
  return Array.isArray(value)
    && value.length <= MAX_FINDING_CODES
    && value.every(item => isIdentifier(item))
    && new Set(value).size === value.length
}

export function isBoundedArray(
  value: unknown,
  maxItems = MAX_DOCUMENT_ITEMS
): value is unknown[] {
  return Array.isArray(value) && value.length <= maxItems
}

export function hasUniqueIds(items: readonly { id: string }[]): boolean {
  return new Set(items.map(item => item.id)).size === items.length
}
