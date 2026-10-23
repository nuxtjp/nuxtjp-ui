import { readFile, readdir } from 'node:fs/promises'
import { expect, test } from 'vitest'

test('every reviewed file is bound to an immutable source and requirement-linked disposition', async () => {
  const review = JSON.parse(await readFile('docs/governance/upstream-reviews/2026-10-23-theme-v2.json', 'utf8'))
  const lock = JSON.parse(await readFile('upstream/sources.lock.json', 'utf8'))
  const requirementIds = new Set<string>()
  for (const file of await readdir('compliance/requirements')) {
    const catalog = JSON.parse(await readFile(`compliance/requirements/${file}`, 'utf8'))
    for (const requirement of catalog.requirements) requirementIds.add(requirement.id)
  }
  expect(review.sources.map((source: { changedFiles: number }) => source.changedFiles)).toEqual([6, 18, 339, 78])
  const mapping: Record<string, string> = {
    tokens: 'dads-design-tokens', theme: 'dads-tailwind-theme', html: 'dads-html-snippets', react: 'dads-react-snippets'
  }
  for (const source of review.sources) {
    expect(source.files.length).toBe(source.changedFiles)
    expect(new Set(source.files.map((file: { path: string }) => file.path)).size).toBe(source.changedFiles)
    expect(lock.sources.find((item: { id: string }) => item.id === mapping[source.id]).probes
      .some((probe: { type: string, expected: string }) => probe.type === 'github-head' && probe.expected === source.head)).toBe(true)
    for (const file of source.files) {
      expect(file.blob).toMatch(/^[a-f0-9]{40}$/)
      expect(file.blob).not.toBe('0'.repeat(40))
      const decision = review.decisions[file.decision]
      expect(decision.reason.length).toBeGreaterThan(30)
      for (const id of decision.requirements) expect(requirementIds.has(id)).toBe(true)
    }
  }
  expect(review.publishedTheme.runtimeDependencyCount).toBe(0)
  expect(review.componentCoveragePromoted).toBe(false)
})
