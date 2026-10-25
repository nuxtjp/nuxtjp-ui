import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import policyTools from '../version-policy.cjs'
import { applySecurityPatches } from '../project.mjs'
import { fileURLToPath } from 'node:url'
const source = fileURLToPath(new URL('../', import.meta.url))
const policy = JSON.parse(readFileSync(new URL('../dependency-versions.json', import.meta.url)))
test('maintained HTTP major fixes coexist and optional absence is explicit', () => {
  assert.doesNotThrow(() => policyTools.checkVersions(policy, { undici: ['6.29.1', '7.30.1', '8.12.2'], 'serialize-javascript': ['7.1.3'], 'fast-uri': ['3.1.9'] }))
  assert.doesNotThrow(() => policyTools.checkVersions(policy, { undici: [] }))
  for (const version of ['6.29.0', '7.29.1', '8.12.1', '9.0.0', '8.12.2-secret']) {
    assert.throws(() => policyTools.checkVersions(policy, { undici: [version] }))
  }
  assert.throws(() => policyTools.checkVersions(policy, { 'serialize-javascript': ['6.0.2'] }))
  assert.throws(() => policyTools.checkVersions(policy, { 'fast-uri': ['3.1.8'] }))
})
test('policy refuses malformed selectors, mismatched majors and old schema', () => {
  for (const overrides of [{ 'undici@*': '8.12.2' }, { 'undici@7': '8.12.2' }, { undici: '^8.12.2' }]) {
    assert.throws(() => policyTools.requirements({ ...policy, overrides }))
  }
  assert.throws(() => policyTools.requirements({ ...policy, schemaVersion: 1 }))
})
test('major-scoped caller rules retain both majors while broad or conflicting overrides never mutate', () => {
  for (const overrides of [{ undici: '8.12.2' }, { 'undici@7': '7.29.1' }, { 'nuxt>undici@*': '8.12.2' }]) {
    const root = mkdtempSync(join(tmpdir(), 'nuxtjp-scoped-policy-'))
    try {
      const file = join(root, 'package.json'), before = JSON.stringify({ pnpm: { overrides } })
      writeFileSync(file, before)
      assert.throws(() => applySecurityPatches(root, source))
      assert.equal(readFileSync(file, 'utf8'), before)
    } finally { rmSync(root, { recursive: true }) }
  }
  assert.doesNotThrow(() => policyTools.validateOverrides(policyTools.requirements(policy), { 'undici@7': '7.30.1', 'undici@8': '8.12.2' }))
})

test('the real active graph admits two patched major lines and rejects a stale nested implementation', async () => {
  const { mkdirSync } = await import('node:fs')
  const root = mkdtempSync(join(tmpdir(), 'nuxtjp-scoped-graph-'))
  try {
    writeFileSync(join(root, 'package.json'), JSON.stringify({ dependencies: { a: '1', b: '1' } }))
    for (const [name, version] of [['a', '7.30.1'], ['b', '8.12.2']]) {
      const dir = join(root, 'node_modules', name, 'node_modules', 'undici')
      mkdirSync(dir, { recursive: true })
      writeFileSync(join(root, 'node_modules', name, 'package.json'), JSON.stringify({ name, dependencies: { undici: version } }))
      writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'undici', version }))
    }
    assert.deepEqual(policyTools.verifyInstalledPolicy(root, policy).undici.sort(), ['7.30.1', '8.12.2'])
    writeFileSync(join(root, 'node_modules/b/node_modules/undici/package.json'), '{"name":"undici","version":"8.12.1"}')
    assert.throws(() => policyTools.verifyInstalledPolicy(root, policy), /outside/)
  } finally { rmSync(root, { recursive: true }) }
})

test('missing required dependency cannot be reported as optional absence', () => {
  const root = mkdtempSync(join(tmpdir(), 'nuxtjp-incomplete-policy-'))
  try {
    writeFileSync(join(root, 'package.json'), '{"dependencies":{"undici":"8.12.1"}}')
    assert.throws(() => policyTools.verifyInstalledPolicy(root, policy), /Incomplete required/)
  } finally { rmSync(root, { recursive: true }) }
})

test('a registry dependency sharing a builtin name is traversed and required', async () => {
  const { mkdirSync } = await import('node:fs')
  const root = mkdtempSync(join(tmpdir(), 'nuxtjp-builtin-policy-'))
  try {
    writeFileSync(join(root, 'package.json'), '{"dependencies":{"buffer":"6.0.3"}}')
    assert.throws(() => policyTools.verifyInstalledPolicy(root, policy), /Incomplete required/)
    mkdirSync(join(root, 'node_modules/buffer'), { recursive: true })
    writeFileSync(join(root, 'node_modules/buffer/package.json'), '{"name":"buffer","version":"6.0.3","dependencies":{"undici":"8.12.1"}}')
    assert.throws(() => policyTools.verifyInstalledPolicy(root, policy), /Incomplete required/)
    mkdirSync(join(root, 'node_modules/undici'), { recursive: true })
    writeFileSync(join(root, 'node_modules/undici/package.json'), '{"name":"undici","version":"8.12.1"}')
    assert.throws(() => policyTools.verifyInstalledPolicy(root, policy), /outside/)
    writeFileSync(join(root, 'node_modules/undici/package.json'), '{"name":"undici","version":"8.12.2"}')
    assert.deepEqual(policyTools.verifyInstalledPolicy(root, policy).undici, ['8.12.2'])
  } finally { rmSync(root, { recursive: true }) }
})
