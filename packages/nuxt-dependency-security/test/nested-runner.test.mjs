import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { verifyProject } from '../checks.mjs'

test('a parent test runner cannot turn missing dependency checks into a passing skipped suite', () => {
  const root = mkdtempSync(join(tmpdir(), 'nuxtjp-nested-check-'))
  try {
    writeFileSync(join(root, 'package.json'), '{"private":true}')
    const result = verifyProject(root)
    assert.notEqual(result.exitCode, 0)
    assert.match(result.stdout + result.stderr, /Dependency not present in the installed application graph/)
    assert.doesNotMatch(result.stderr, /being called recursively/)
  } finally { rmSync(root, { recursive: true }) }
})
