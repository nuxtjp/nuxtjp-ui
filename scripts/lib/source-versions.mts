import type { Coverage, SourceLock } from './compliance-types.ts'

function versionParts(version: string | undefined): number[] | null {
  return version && /^\d+\.\d+\.\d+$/.test(version) ? version.split('.').map(Number) : null
}
function older(left: number[], right: number[]): boolean {
  for (let index = 0; index < 3; index++) {
    if (left[index] !== right[index]) return left[index]! < right[index]!
  }
  return false
}

export function sourceVersionErrors(lock: SourceLock, coverage: Coverage, dependencies: Record<string, string>): string[] {
  const errors: string[] = []
  const baseline = lock.implementationBaseline
  if (!baseline || coverage.sourceVersion !== baseline.version || coverage.checkedAt !== baseline.checkedAt) {
    errors.push('coverage: implementation baseline differs from source lock')
  }
  if (coverage.components.length !== baseline?.componentCount) errors.push('coverage: component inventory differs from baseline')
  const documentVersion = versionParts(lock.sources.find(source => source.id === 'dads-core')?.observedVersion)
  for (const id of ['dads-design-tokens', 'dads-tailwind-theme']) {
    const source = lock.sources.find(item => item.id === id)
    const compatible = versionParts(source?.compatibilityVersion)
    if (!source || !compatible || !documentVersion) {
      errors.push(`${id}: explicit compatibility version required`)
      continue
    }
    if (older(compatible, documentVersion) && (source.status !== 'compatibility-lag' || !source.notes)) {
      errors.push(`${id}: compatibility lag must be explicit`)
    }
  }
  const theme = lock.sources.find(source => source.id === 'dads-tailwind-theme')
  if (!theme?.consumedVersion || theme.consumedVersion !== dependencies['@digital-go-jp/tailwind-theme-plugin']) {
    errors.push('dads-tailwind-theme: consumed version differs from dependency manifest')
  }
  return errors
}
