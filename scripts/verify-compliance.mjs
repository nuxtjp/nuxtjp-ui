#!/usr/bin/env node
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { verifyRepository } from "./lib/compliance-verify.mjs"

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, "..")

try {
  const report = await verifyRepository(repositoryRoot)
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
  process.exitCode = report.valid ? 0 : 1
} catch (error) {
  process.stderr.write(`${JSON.stringify({
    valid: false,
    error: "compliance-verification-failed",
    detail: error instanceof Error ? error.message : String(error)
  }, null, 2)}\n`)
  process.exitCode = 1
}
