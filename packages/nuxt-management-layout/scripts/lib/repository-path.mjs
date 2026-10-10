import { lstat, realpath } from 'node:fs/promises'
import { isAbsolute, relative, resolve } from 'node:path'

export async function repositoryPathExists(root, value) {
  if (!safeRelativePath(value)) return false
  try {
    const canonicalRoot = await realpath(root)
    const target = resolve(canonicalRoot, value)
    const canonicalTarget = await realpath(target)
    const relation = relative(canonicalRoot, canonicalTarget)
    if (relation.startsWith('..') || isAbsolute(relation)) return false
    const metadata = await lstat(target)
    return !metadata.isSymbolicLink()
  } catch {
    return false
  }
}

export function safeRelativePath(value) {
  if (typeof value !== 'string' || !value || isAbsolute(value)) return false
  const parts = value.split(/[\\/]/u)
  return !parts.includes('..') && !parts.includes('.') && !parts.includes('')
}
