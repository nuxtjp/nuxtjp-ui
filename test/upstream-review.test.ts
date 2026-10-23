import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { expect, test } from 'vitest'

type Decision = { reason: string, requirements: string[], disposition: string }
type Change = { path: string, blob: string, status: string, decision: string }
type Source = {
  id: string, repository: string, base: string, head: string,
  commits: number, changedFiles: number, comparisonUrl: string, files: Change[]
}
type Review = {
  issue: number, implementationBaseline: string, documentVersion: string,
  runtimeChanged: boolean, conformancePromoted: boolean,
  decisions: Record<string, Decision>, sources: Source[], regressions: string[]
}
const read = async (path: string) => JSON.parse(await readFile(resolve(path), 'utf8'))

function reviewErrors(review: Review): string[] {
  const errors: string[] = []
  for (const source of review.sources) {
    if (source.files.length !== source.changedFiles) errors.push('incomplete inventory')
    if (new Set(source.files.map(file => file.path)).size !== source.files.length) errors.push('duplicate path')
    if (source.comparisonUrl !== `https://github.com/${source.repository}/compare/${source.base}...${source.head}`) {
      errors.push('unbound comparison')
    }
    for (const file of source.files) {
      if (!/^[a-f0-9]{40}$/.test(file.blob)) errors.push('missing blob identity')
      const decision = review.decisions[file.decision]
      if (!decision?.reason || !decision.requirements.length) errors.push('missing rationale')
    }
  }
  return errors
}

test('the bounded review classifies every changed upstream file without promoting conformance', async () => {
  const review: Review = await read('docs/governance/upstream-reviews/2026-10-23.json')
  const original = await read('docs/governance/upstream-reviews/2026-10-20.json')
  const coverage = await read('compliance/coverage/components.json')
  expect(reviewErrors(review)).toEqual([])
  expect(review.sources.map(source => [source.id, source.commits, source.changedFiles]))
    .toEqual([['tokens', 2, 1], ['html', 18, 61], ['react', 32, 93]])
  for (const source of review.sources) {
    expect(original.changed.some((item: { actual: string }) => item.actual === source.head)).toBe(true)
  }
  expect(review.issue).toBe(38)
  expect(review.documentVersion).toBe('2.18.1')
  expect(review.implementationBaseline).toBe(coverage.sourceVersion)
  expect(review.runtimeChanged).toBe(false)
  expect(review.conformancePromoted).toBe(false)
  for (const decision of Object.values(review.decisions)) {
    expect(['reference-only', 'not-adopted', 'retain-local']).toContain(decision.disposition)
  }
  for (const path of review.regressions) expect((await readFile(resolve(path))).length).toBeGreaterThan(0)
})

test('an incomplete or unreasoned review cannot satisfy the acceptance contract', async () => {
  const review: Review = await read('docs/governance/upstream-reviews/2026-10-23.json')
  const incomplete = structuredClone(review)
  incomplete.sources[0]!.files.pop()
  expect(reviewErrors(incomplete)).toContain('incomplete inventory')
  const unreasoned = structuredClone(review)
  unreasoned.sources[0]!.files[0]!.decision = 'unknown'
  expect(reviewErrors(unreasoned)).toContain('missing rationale')
  const unbound = structuredClone(review)
  unbound.sources[0]!.head = '0'.repeat(40)
  expect(reviewErrors(unbound)).toContain('unbound comparison')
})

test('review decisions name real requirement IDs and do not import reference frameworks', async () => {
  const review: Review = await read('docs/governance/upstream-reviews/2026-10-23.json')
  const catalog = await read('compliance/requirements/components.json')
  const ids = new Set(catalog.requirements.map((item: { id: string }) => item.id))
  for (const decision of Object.values(review.decisions)) {
    for (const id of decision.requirements) expect(ids.has(id)).toBe(true)
  }
  const pkg = await read('package.json')
  expect(pkg.dependencies.react).toBeUndefined()
  const css = await readFile(resolve('src/runtime/app/assets/nuxtjp-ui.css'), 'utf8')
  expect(css).not.toMatch(/-apple-system|BlinkMacSystemFont|--spacing\s*:/)
})
