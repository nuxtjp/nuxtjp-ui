import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync, spawn } from 'node:child_process'
import { createServer } from 'node:net'

const archive = resolve(process.argv[2])
const manager = process.argv[3] ?? 'npm'
const helperArchive = process.argv[4] ? resolve(process.argv[4]) : null
assert.ok(['npm', 'pnpm'].includes(manager))
const root = mkdtempSync(join(tmpdir(), 'nuxtjp-ui-consumer-'))
const env = { ...process.env, NPM_CONFIG_CACHE: join(root, 'empty-cache'), CI: 'true', NUXT_TELEMETRY_DISABLED: '1' }
for (const key of ['NPM_TOKEN', 'NODE_AUTH_TOKEN', 'GH_TOKEN', 'GITHUB_TOKEN']) delete env[key]
writeFileSync(join(root, '.npmrc'), '')
env.NPM_CONFIG_USERCONFIG = join(root, '.npmrc')
writeFileSync(join(root, 'package.json'), JSON.stringify({
  private: true, type: 'module', ...(helperArchive && manager === 'pnpm' ? {pnpm: {overrides: {'@nuxtjp/dependency-security': `file:${helperArchive}`}}} : {}), dependencies: { ...(helperArchive ? {'@nuxtjp/dependency-security': `file:${helperArchive}`} : {}), '@nuxtjp/ui': `file:${archive}`, nuxt: '4.5.2', vue: '3.5.43' },
  devDependencies: { typescript: '5.9.3', 'vue-tsc': '3.2.8' }
}, null, 2))
function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, env, encoding: 'utf8', timeout: 600_000 })
  if (result.status !== 0) throw new Error(`${command} failed: ${result.stdout?.slice(-6000)} ${result.stderr?.slice(-6000)}`)
  console.log(JSON.stringify({ step: [command, ...args], status: 'pass' }))
}
if (manager === 'npm') run('npm', ['install', '--registry=https://registry.npmjs.org', '--no-audit', '--no-fund'])
else run('pnpm', ['install', '--store-dir', join(root, 'empty-store'), '--registry=https://registry.npmjs.org'])
writeFileSync(join(root, 'core-smoke.mjs'), `
import assert from 'node:assert/strict'
import { nuxtJpUiTransport, nuxtJpUiReadState } from '@nuxtjp/ui/core'
assert.equal(nuxtJpUiTransport('pending', null, null), 'loading')
assert.equal(nuxtJpUiReadState('success', {}, null), 'ready')
assert.equal(nuxtJpUiReadState('error', {}, new Error('expected')), 'error')
`)
run('node', ['core-smoke.mjs'])
writeFileSync(join(root, 'nuxt.config.ts'), `export default defineNuxtConfig({ modules: ['@nuxtjp/ui'], nuxtJpUi: { locale: 'ja' }, devtools: { enabled: false } })`)
mkdirSync(join(root, 'app'))
writeFileSync(join(root, 'tsconfig.json'), JSON.stringify({ extends: './.nuxt/tsconfig.json' }))
writeFileSync(join(root, 'app/core-types.ts'), `import type { NuxtJpUiLocale } from '@nuxtjp/ui/core'; export const locale: NuxtJpUiLocale = 'ja'`)
writeFileSync(join(root, 'app/app.vue'), `<template><NuxtJpApp><NuxtJpPageHeader title="Archive consumer" description="Independent package" /><NuxtJpStatusBadge color="success" label="確認済み" /></NuxtJpApp></template>`)
run('node', ['node_modules/nuxt/bin/nuxt.mjs', 'prepare'])
run('node', ['node_modules/nuxt/bin/nuxt.mjs', 'typecheck'])
run('node', ['node_modules/nuxt/bin/nuxt.mjs', 'build'])
const port = await new Promise(resolvePort => {
  const socket = createServer().listen(0, '127.0.0.1', () => {
    const value = socket.address().port
    socket.close(() => resolvePort(value))
  })
})
const server = spawn('node', ['.output/server/index.mjs'], { cwd: root, env: { ...env, NITRO_PORT: String(port), NITRO_HOST: '127.0.0.1' }, stdio: 'ignore' })
try {
  let html
  for (let attempt = 0; attempt < 40; attempt++) {
    try { const response = await fetch(`http://127.0.0.1:${port}`); if (response.ok) { html = await response.text(); break } } catch {}
    await new Promise(resolveWait => setTimeout(resolveWait, 250))
  }
  assert.ok(html?.includes('lang="ja"'))
  assert.ok(html.includes('Archive consumer'))
  assert.ok(html.includes('確認済み'))
  if (manager === 'npm') {
    const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'))
    for (const [name, item] of Object.entries(lock.packages)) {
      if (name === '' || name === 'node_modules/@nuxtjp/ui') continue
      if (name === 'node_modules/@nuxtjp/dependency-security' && helperArchive) { assert.equal(resolve(root, item.resolved.slice(5)), helperArchive); continue }
      if (item.resolved) assert.ok(item.resolved.startsWith('https://registry.npmjs.org/'), `Non-public dependency: ${name}`)
    }
  } else {
    const listed = spawnSync('pnpm', ['list', '--json', '--depth', 'Infinity'], { cwd: root, env, encoding: 'utf8', timeout: 60_000, maxBuffer: 64 * 1024 * 1024 })
    assert.equal(listed.status, 0)
    function checkPackages(groups) {
      for (const [name, item] of Object.entries(groups ?? {})) {
        assert.equal(typeof item.resolved, 'string', `Missing resolved source: ${name}`)
        if (name === '@nuxtjp/dependency-security' && helperArchive) {
          assert.ok(item.resolved.startsWith('file:'));assert.equal(resolve(root,item.resolved.slice(5)),helperArchive)
        } else if (name === '@nuxtjp/ui') {
          assert.ok(item.resolved.startsWith('file:'))
          assert.equal(resolve(root, item.resolved.slice(5)), archive)
        } else assert.ok(item.resolved.startsWith('https://registry.npmjs.org/'), `Non-public source: ${name}`)
        for (const key of ['dependencies', 'devDependencies', 'optionalDependencies']) checkPackages(item[key])
      }
    }
    for (const item of JSON.parse(listed.stdout)) {
      for (const key of ['dependencies', 'devDependencies', 'optionalDependencies']) checkPackages(item[key])
    }
  }
  console.log(JSON.stringify({ result: 'pass', manager, root, registry_dependencies_only: true, archive_source_only: true, core_import: true, typecheck: true, production_build: true, SSR: true }))
} finally { server.kill('SIGTERM') }
