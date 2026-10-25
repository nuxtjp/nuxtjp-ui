/** Execute only the known installed dependency regression suite in a selected project. */
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { realpathSync } from 'node:fs'
import { dirname } from 'node:path'
import resolver from './resolved-dependency.cjs'
export function verifyProject(project, options = {}) {
  const root = realpathSync(project)
  const projects = resolver.projectManifests(root, options.projects).map(dirname)
  const env = { ...process.env }
  // A parent's node:test context would silently skip a child suite.
  for (const name of ['NODE_TEST_CONTEXT', 'NODE_OPTIONS', 'NODE_PATH', 'NUXTJP_SECURITY_PROJECTS']) delete env[name]
  env.NUXTJP_SECURITY_PROJECTS = JSON.stringify(projects)
  const result = spawnSync(process.execPath,
    ['--test', fileURLToPath(new URL('./dependency-security.check.cjs', import.meta.url))],
    { cwd: root, env, encoding: 'utf8', timeout: 120000, maxBuffer: 4 * 1024 * 1024 })
  return { exitCode: result.status ?? 2, stdout: result.stdout ?? '', stderr: result.stderr ?? '' }
}
