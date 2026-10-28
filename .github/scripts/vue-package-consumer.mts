import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, chmodSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { createServer } from 'node:net'
import { vueConsumerFiles } from './vue-consumer-fixture.mts'
const archive = resolve(process.argv[2]!)
const root = mkdtempSync(join(tmpdir(), 'nuxtjp-vue-consumer-')); chmodSync(root, 0o700)
const env = { ...process.env, CI: 'true', NPM_CONFIG_USERCONFIG: join(root, '.npmrc'), NPM_CONFIG_CACHE: join(root, 'cache'), NODE_OPTIONS: '--max-old-space-size=768' }
for (const key of ['NPM_TOKEN', 'NODE_AUTH_TOKEN', 'GH_TOKEN', 'GITHUB_TOKEN']) delete env[key]
writeFileSync(join(root, '.npmrc'), '')
function run(command: string, args: string[]) {
  const result = spawnSync(command, args, { cwd: root, env, encoding: 'utf8', timeout: 180000, maxBuffer: 2097152 })
  assert.equal(result.status, 0, String(result.stdout).slice(-10000) + String(result.stderr).slice(-10000))
}
try {
  writeFileSync(join(root, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: {
    '@nuxtjp/ui': `file:${archive}`, '@nuxt/ui': '4.12.0', '@nuxt/icon': '2.6.0', vue: '3.5.44', 'vue-router': '5.4.0',
  }, devDependencies: { vite: '8.3.4', '@vitejs/plugin-vue': '6.0.10', typescript: '5.9.3', 'vue-tsc': '3.3.13', '@playwright/test': '1.64.1' } }))
  run('npm', ['install', '--ignore-scripts', '--registry=https://registry.npmjs.org/', '--no-audit', '--no-fund'])
  for (const [name, contents] of Object.entries(vueConsumerFiles)) { mkdirSync(dirname(join(root, name)), { recursive: true }); writeFileSync(join(root, name), contents) }
  run('node', ['node_modules/vue-tsc/bin/vue-tsc.js', '--noEmit'])
  run('node', ['node_modules/vite/bin/vite.js', 'build'])
  const port = await new Promise<number>(resolvePort => { const server = createServer().listen(0, '127.0.0.1', () => { const address = server.address(); assert.ok(address && typeof address !== 'string'); server.close(() => resolvePort(address.port)) }) })
  writeFileSync(join(root, 'playwright.config.ts'), `export default {workers:1,retries:0,timeout:45000,globalTimeout:120000,expect:{timeout:10000},use:{baseURL:'http://127.0.0.1:${port}',headless:true},webServer:{command:'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port ${port} --strictPort',url:'http://127.0.0.1:${port}',reuseExistingServer:false,timeout:15000,gracefulShutdown:{signal:'SIGTERM',timeout:5000}}}`)
  run('node', ['node_modules/@playwright/test/cli.js', 'test'])
  console.log(JSON.stringify({ state: 'complete', packedVueEntry: true, typecheck: true, viteBuild: true, actualTableAndChartBrowser: true, ssrServerStarted: false, productSpecificData: false }))
} finally { rmSync(root, { recursive: true, force: true }) }
