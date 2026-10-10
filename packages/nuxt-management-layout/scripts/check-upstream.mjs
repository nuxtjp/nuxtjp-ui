#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkSources, exitCodeFor } from './lib/upstream-check.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

try {
  const lock = JSON.parse(await readFile(resolve(root, 'upstream/sources.lock.json'), 'utf8'))
  const report = await checkSources(lock)
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
  process.exitCode = exitCodeFor(report)
} catch (error) {
  process.stderr.write(`${JSON.stringify({
    error: 'upstream-check-failed',
    detail: error instanceof Error ? error.message : String(error),
    disposition: 'review-required'
  }, null, 2)}\n`)
  process.exitCode = 1
}
