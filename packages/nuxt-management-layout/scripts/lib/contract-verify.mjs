import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { repositoryPathExists } from './repository-path.mjs'
import { validateSchemas } from './schema-validation.mjs'
import { auditSources } from './source-audit.mjs'

const implementationFiles = [
  'app/app.config.ts', 'app/app.vue', 'app/components/NuxtJpManagementStatusSummary.vue',
  'app/composables/useNuxtJpManagementLayout.ts', 'app/layouts/default.vue',
  'core/config.ts', 'core/config-validation.ts', 'core/navigation.ts',
  'core/status.ts', 'core/status-types.ts', 'nuxt.config.ts'
]

export async function verifyContract(root) {
  const lock = await readJson(resolve(root, 'upstream/sources.lock.json'))
  const requirements = await readJson(resolve(root, 'compliance/requirements.json'))
  const manifest = await readJson(resolve(root, 'package.json'))
  const errors = await validateSchemas(root, { lock, requirements })
  const sourceIds = new Set(lock.sources.map(source => source.id))
  unique(lock.sources.map(source => source.id), 'source', errors)
  unique(requirements.requirements.map(item => item.id), 'requirement', errors)
  for (const item of requirements.requirements) {
    for (const id of item.sourceIds) if (!sourceIds.has(id)) errors.push(`${item.id}: unknown source ${id}`)
    for (const path of [...item.artifacts, ...item.tests]) {
      if (!(await repositoryPathExists(root, path))) errors.push(`${item.id}: invalid or missing ${path}`)
    }
  }
  verifyDependencyBoundary(manifest, await readFile(resolve(root, 'nuxt.config.ts'), 'utf8'), errors)
  const implementation = (await Promise.all(implementationFiles.map(path =>
    readFile(resolve(root, path), 'utf8')))).join('\n')
  if (/Coela|Crowsi|Cloudflare|GitHub App|Policy Authority/u.test(implementation)) {
    errors.push('implementation contains product or provider language')
  }
  errors.push(...await auditSources(root))
  return {
    valid: errors.length === 0,
    summary: { sources: lock.sources.length, requirements: requirements.requirements.length },
    errors
  }
}

function verifyDependencyBoundary(manifest, config, errors) {
  if (manifest.main !== './nuxt.config.ts') errors.push('package main must be nuxt.config.ts')
  if (manifest.peerDependencies?.['@nuxtjp/ui'] !== '0.1.3') {
    errors.push('@nuxtjp/ui must be an explicit peer dependency')
  }
  for (const name of ['@nuxt/ui', '@digital-go-jp/tailwind-theme-plugin', 'tailwindcss']) {
    if (manifest.dependencies?.[name] || manifest.peerDependencies?.[name]) {
      errors.push(`direct foundation dependency is not allowed: ${name}`)
    }
  }
  if (!/modules:\s*\['@nuxtjp\/ui'\]/u.test(config)) errors.push('NuxtJP UI module is not registered')
  if (!/fileURLToPath[\s\S]*import\.meta\.url/u.test(config)) errors.push('Layer path is not import-relative')
}

function unique(values, label, errors) {
  const seen = new Set()
  for (const value of values) {
    if (seen.has(value)) errors.push(`duplicate ${label}: ${value}`)
    seen.add(value)
  }
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}
