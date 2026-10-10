/** Configure only the explicitly selected project with this package's reviewed assets. */
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applySecurityPatches as configure } from './project.mjs'
export { installedDependencies } from './resolved-dependency.cjs'
export function applySecurityPatches(project) { configure(project, dirname(fileURLToPath(import.meta.url))) }
