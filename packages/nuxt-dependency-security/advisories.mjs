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

/** Verify audit totals as well as each advisory against the tested active graph. */
export function verifyAuditReport(project, report, options = {}) {
  if (!report || typeof report !== 'object' || !report.advisories || typeof report.advisories !== 'object') {
    throw new Error('Invalid audit report')
  }
  const findings = Object.values(report.advisories)
  const totals = report.metadata?.vulnerabilities
  for (const severity of ['info', 'low', 'moderate', 'high', 'critical']) {
    const total = totals?.[severity]
    if (!Number.isSafeInteger(total) || total < 0) throw new Error(`Invalid ${severity} audit total`)
    if (['critical', 'moderate'].includes(severity) && total !== 0) throw new Error(`Unexpected ${severity} vulnerabilities`)
    if (total > findings.filter(item => item?.severity === severity).length) {
      throw new Error(`Unaccounted ${severity} vulnerabilities`)
    }
  }
  verifyAuditedAdvisories(project, findings.map(item => item?.github_advisory_id), options)
}
