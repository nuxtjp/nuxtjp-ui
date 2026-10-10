import { readFile, readdir } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'

const ignoredDirectories = new Set([
  '.git', '.nuxt', '.output', 'node_modules', 'vendor'
])
const ignoredFiles = new Set(['pnpm-lock.yaml', 'LICENSE'])
const sourceExtensions = new Set([
  '.css', '.json', '.md', '.mjs', '.toml', '.ts', '.vue', '.yml', '.yaml'
])

export async function auditSources(root, maximumLines = 149) {
  const errors = []
  for (const path of await sourceFiles(root)) {
    const content = await readFile(path, 'utf8')
    const name = relative(root, path)
    const lines = content.split(/\r?\n/u).length - (content.endsWith('\n') ? 1 : 0)
    if (lines > maximumLines) errors.push(`${name}: ${lines} lines exceeds ${maximumLines}`)
    if (/\/home\/[A-Za-z0-9_-]+\//u.test(content)) errors.push(`${name}: absolute home path`)
  }
  return errors
}

async function sourceFiles(root, directory = root) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await sourceFiles(root, path))
    if (entry.isFile() && !ignoredFiles.has(entry.name) && sourceExtensions.has(extname(path))) {
      files.push(path)
    }
  }
  return files
}
