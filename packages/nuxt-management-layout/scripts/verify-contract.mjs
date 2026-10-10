#!/usr/bin/env node
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { verifyContract } from './lib/contract-verify.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

try {
  const report = await verifyContract(root)
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
  process.exitCode = report.valid ? 0 : 1
} catch (error) {
  process.stderr.write(`${JSON.stringify({
    valid: false,
    error: 'contract-verification-failed',
    detail: error instanceof Error ? error.message : String(error)
  }, null, 2)}\n`)
  process.exitCode = 1
}
