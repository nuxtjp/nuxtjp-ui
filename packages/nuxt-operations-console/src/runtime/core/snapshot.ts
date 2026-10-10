/**
 * Validation snapshots detach rendering from caller-owned reactive data.
 * Inputs are JSON projection contracts, so a JSON round trip is intentional.
 */
export function immutableSnapshot<T>(value: T): T {
  const clone = JSON.parse(JSON.stringify(value)) as T
  return deepFreeze(clone)
}

function deepFreeze<T>(value: T): T {
  if (typeof value !== 'object' || value === null || Object.isFrozen(value)) return value
  for (const child of Object.values(value)) deepFreeze(child)
  return Object.freeze(value)
}
