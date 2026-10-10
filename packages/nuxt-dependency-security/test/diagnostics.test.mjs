import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

test('malformed caller JSON never appears in command diagnostics', () => {
  const root = mkdtempSync(join(tmpdir(), 'nuxtjp-invalid-json-'))
  const marker = 'NEVER-ISSUED-DO-NOT-PRINT'
  try {
    writeFileSync(join(root, 'package.json'), '{' + marker)
    const result = spawnSync(process.execPath, [fileURLToPath(new URL('../apply.mjs', import.meta.url)), '--project-root', root, '--apply'], { encoding: 'utf8' })
    assert.notEqual(result.status, 0)
    assert.ok(!((result.stdout ?? '') + (result.stderr ?? '')).includes(marker))
    assert.match(result.stderr, /could not be applied/)
  } finally { rmSync(root, { recursive: true }) }
})
