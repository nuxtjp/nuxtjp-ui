#!/usr/bin/env node
/** Verify active installed dependencies using bounded negative-input regression cases. */
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { realpathSync } from 'node:fs'
const args = process.argv.slice(2)
if (args.length !== 2 || args[0] !== '--project-root') {
  console.error('Usage: nuxtjp-security-check --project-root PROJECT')
  process.exitCode = 2
} else {
  try {
    const result = spawnSync(process.execPath, ['--test', fileURLToPath(new URL('./dependency-security.check.cjs', import.meta.url))],
      { cwd: realpathSync(args[1]), stdio: 'inherit', timeout: 120000 })
    process.exitCode = result.status ?? 2
  } catch { console.error('Selected project cannot be verified'); process.exitCode = 2 }
}
