import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import resolver from '../resolved-dependency.cjs'
import policyTools from '../version-policy.cjs'
import { verifyProject } from '../checks.mjs'
const policy = JSON.parse(readFileSync(new URL('../dependency-versions.json', import.meta.url)))
function manifest(root, relative, data) {
  const directory = join(root, relative); mkdirSync(directory, { recursive: true })
  writeFileSync(join(directory, 'package.json'), JSON.stringify(data))
  return directory
}
test('workspace selection follows linked owner projects and every selected dev graph, excluding unused store entries', () => {
  const root = mkdtempSync(join(tmpdir(), 'nuxtjp-workspace-'))
  try {
    manifest(root, '.', { name: 'workspace', private: true })
    const app = manifest(root, 'apps/web', { name: 'web', dependencies: { domain: 'workspace:*' }, devDependencies: { undici: '7.30.1' } })
    const domain = manifest(root, 'packages/domain', { name: 'domain', devDependencies: { undici: '8.12.2' } })
    mkdirSync(join(app, 'node_modules'), { recursive: true })
    symlinkSync(domain, join(app, 'node_modules/domain'))
    manifest(root, 'apps/web/node_modules/undici', { name: 'undici', version: '7.30.1' })
    manifest(root, 'packages/domain/node_modules/undici', { name: 'undici', version: '8.12.2' })
    manifest(root, 'node_modules/.pnpm/unused/node_modules/undici', { name: 'undici', version: '8.12.1' })
    const projects = ['.', 'apps/web', 'packages/domain']
    assert.deepEqual(policyTools.verifyInstalledPolicy(root, policy, { projects }).undici.sort(), ['7.30.1', '8.12.2'])
    assert.equal(resolver.installedDependencies(root, 'domain', undefined, { projects }).length, 1)
    manifest(root, 'packages/domain/node_modules/undici', { name: 'undici', version: '8.12.1' })
    assert.throws(() => policyTools.verifyInstalledPolicy(root, policy, { projects }), /outside the reviewed/)
    rmSync(join(domain, 'node_modules/undici'), { recursive: true })
    assert.throws(() => policyTools.verifyInstalledPolicy(root, policy, { projects }), /Incomplete required/)
  } finally { rmSync(root, { recursive: true }) }
})
test('workspace inventory rejects empty, duplicate, missing root, external, linked manifest and store selections', () => {
  const root = mkdtempSync(join(tmpdir(), 'nuxtjp-workspace-refusal-'))
  const outside = mkdtempSync(join(tmpdir(), 'nuxtjp-external-'))
  try {
    manifest(root, '.', { private: true }); manifest(root, 'apps/web', { private: true })
    manifest(root, 'node_modules/store-project', { private: true }); manifest(outside, '.', { private: true })
    symlinkSync(outside, join(root, 'external'))
    mkdirSync(join(root, 'linked-manifest')); symlinkSync(join(outside, 'package.json'), join(root, 'linked-manifest/package.json'))
    for (const projects of [[], ['.', '.'], ['apps/web'], ['.', 'external'], ['.', 'linked-manifest'], ['.', 'node_modules/store-project'], Array(257).fill('.')]) {
      assert.throws(() => verifyProject(root, { projects }))
    }
  } finally { rmSync(root, { recursive: true }); rmSync(outside, { recursive: true }) }
})
test('ambient graph-selection state cannot broaden a verification request', () => {
  const root = mkdtempSync(join(tmpdir(), 'nuxtjp-ambient-workspace-'))
  const previous = process.env.NUXTJP_SECURITY_PROJECTS
  try {
    manifest(root, '.', { private: true }); process.env.NUXTJP_SECURITY_PROJECTS = '["/not-an-approved-workspace"]'
    const result = verifyProject(root)
    assert.notEqual(result.exitCode, 0)
    assert.match(result.stdout + result.stderr, /Dependency not present/)
    assert.doesNotMatch(result.stdout + result.stderr, /not-an-approved-workspace/)
  } finally {
    if (previous === undefined) delete process.env.NUXTJP_SECURITY_PROJECTS; else process.env.NUXTJP_SECURITY_PROJECTS = previous
    rmSync(root, { recursive: true })
  }
})
