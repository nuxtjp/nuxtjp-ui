/** Configure caller-owned pnpm backports without executing installs or changing unrelated settings. */
import { existsSync, lstatSync, readFileSync, mkdirSync, writeFileSync, renameSync, unlinkSync, realpathSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import resolver from './resolved-dependency.cjs'
import versionPolicy from './version-policy.cjs'

const patches = ['braces@3.0.3', 'node-forge@1.4.0', 'simple-git@4.0.2']
function regular(path) {
  const stat = lstatSync(path)
  if (stat.isSymbolicLink() || !stat.isFile() || stat.size > 1024 * 1024) {
    throw new Error('Expected a bounded regular project or patch file')
  }
  return readFileSync(path)
}
function parseJson(bytes) {
  try { return JSON.parse(bytes.toString('utf8')) }
  catch { throw new Error('Invalid JSON document') }
}
function object(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/** Reject conflicting patches and links before mutating a project. No network access occurs. */
export function applySecurityPatches(project, source) {
  const root = realpathSync(resolve(project))
  if (existsSync(join(root, 'pnpm-workspace.yaml'))) {
    regular(join(root, 'pnpm-workspace.yaml'))
    const error = new Error('Use the owner-native workspace configuration; no second manifest policy was written')
    error.code = 'UNSUPPORTED_WORKSPACE_CONFIGURATION'
    throw error
  }
  const manifest = join(root, 'package.json')
  const original = regular(manifest)
  const data = parseJson(original)
  if (!object(data) || (data.pnpm !== undefined && !object(data.pnpm))) {
    throw new Error('Expected a package manifest with object-valued pnpm settings')
  }
  const pnpm = data.pnpm ?? {}
  const existing = pnpm.patchedDependencies ?? {}
  if (!object(existing)) throw new Error('Expected object-valued patchedDependencies')
  const pinned = parseJson(regular(join(source, 'dependency-versions.json')))
  const rules = versionPolicy.requirements(pinned)
  const overrides = pnpm.overrides ?? {}
  if (!object(overrides)) throw new Error('Expected object-valued dependency overrides')
  versionPolicy.validateOverrides(rules, overrides)
  const dir = join(root, '.nuxtjp-security')
  if (existsSync(dir) && (lstatSync(dir).isSymbolicLink() || !lstatSync(dir).isDirectory())) {
    throw new Error('Security patch directory must be a real directory')
  }
  const activeSimpleGit = resolver.installedDependencies(root, 'simple-git', undefined, { allowMissing: true }).length > 0
  const inputs = patches.map(name => {
    const relative = `.nuxtjp-security/${name.replace('@', '-')}.patch`
    if (existing[name] !== undefined && existing[name] !== relative) {
      throw new Error('An existing dependency patch conflicts; review it before applying')
    }
    const bytes = regular(join(source, 'patches', `${name.replace('@', '-')}.patch`))
    const target = join(root, relative)
    if (existsSync(target) && !regular(target).equals(bytes)) {
      throw new Error('An existing patch differs; no files were overwritten')
    }
    return { name, relative, bytes, target, required: name !== 'simple-git@4.0.2' || activeSimpleGit }
  })
  if (!readFileSync(manifest).equals(original)) throw new Error('Manifest changed during preparation')
  mkdirSync(dir, { recursive: true })
  for (const patch of inputs) {
    if (!patch.required) {
      delete existing[patch.name]
      continue
    }
    if (!existsSync(patch.target)) writeFileSync(patch.target, patch.bytes, { flag: 'wx' })
    existing[patch.name] = patch.relative
  }
  data.pnpm = { ...pnpm, patchedDependencies: existing, overrides: { ...overrides, ...pinned.overrides } }
  const temporary = join(root, `.nuxtjp-manifest-${randomUUID()}.tmp`)
  try {
    writeFileSync(temporary, JSON.stringify(data, null, 2) + '\n', { flag: 'wx' })
    if (!readFileSync(manifest).equals(original)) throw new Error('Manifest changed; retry after review')
    renameSync(temporary, manifest)
  } finally {
    if (existsSync(temporary)) unlinkSync(temporary)
  }
}
