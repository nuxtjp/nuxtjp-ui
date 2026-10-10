#!/usr/bin/env node
/** Verify active installed dependencies through the bounded regression entry point. */
import { verifyProject } from './checks.mjs'
const args = process.argv.slice(2)
if (args.length !== 2 || args[0] !== '--project-root') {
  console.error('Usage: nuxtjp-security-check --project-root PROJECT')
  process.exitCode = 2
} else {
  try {
    const result = verifyProject(args[1])
    process.stdout.write(result.stdout)
    process.stderr.write(result.stderr)
    process.exitCode = result.exitCode
  } catch { console.error('Selected project cannot be verified'); process.exitCode = 2 }
}
