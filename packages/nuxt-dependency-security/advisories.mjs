/** Bind accepted version-only audit findings to actual tested dependency targets. */
import { readFileSync } from 'node:fs'
import { verifyProject } from './checks.mjs'
import resolver from './resolved-dependency.cjs'

const targets = Object.freeze({
  'GHSA-vfj7-8cjw-p6xm': 'braces',
  'GHSA-86w9-cpqp-85rv': 'node-forge',
  'GHSA-gcqx-w48m-w2h4': 'deepmerge',
})

export function verifyAuditedAdvisories(project, advisories, options = {}) {
  if (!Array.isArray(advisories)) throw new Error('Expected an advisory identifier array')
  const policy = JSON.parse(readFileSync(new URL('./dependency-versions.json', import.meta.url)))
  for (const id of advisories) {
    const target = targets[id]
    if (!target || !policy.backportedAdvisories.includes(id)) throw new Error(`Unremediated advisory: ${id}`)
    if (!resolver.installedDependencies(project, target, undefined, { ...options, allowMissing: true }).length) {
      throw new Error(`Reported advisory has no active regression target: ${id}`)
    }
  }
  const result = verifyProject(project, options)
  if (result.exitCode !== 0) throw new Error('Installed dependency regressions failed')
}
