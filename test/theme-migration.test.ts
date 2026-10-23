import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { expect, test } from 'vitest'

const legacy = /\b(?:leading-1-(?:0|2|3|4|5|6|7|75)|list-(?:lower-latin|circle|square))\b|--leading-1-/
async function ownedSources(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const groups = await Promise.all(entries.map(async entry => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) {
      return ['node_modules', '.nuxt', '.output', 'dist'].includes(entry.name) ? [] : ownedSources(path)
    }
    return /\.(vue|css|ts)$/.test(entry.name) ? [path] : []
  }))
  return groups.flat()
}

test('the installed published v4 artifact contains the corrected token and excludes removed aliases', async () => {
  const css = await readFile(new URL(import.meta.resolve('@digital-go-jp/tailwind-theme-plugin/v4')), 'utf8')
  expect(css).toMatch(/--color-opacity-gray-536:\s*rgba\(0, 0, 0, 0\.536\)/)
  expect(css).toMatch(/--leading-170:\s*1\.7/)
  expect(css).not.toMatch(legacy)
  expect(css).not.toMatch(/-apple-system|BlinkMacSystemFont/)
})

test('owned UI and management caller sources do not consume removed theme utilities', async () => {
  const files = (await Promise.all([
    'src', 'playground', 'packages/nuxt-management-layout/app'
  ].map(path => ownedSources(resolve(path))))).flat()
  expect(files.length).toBeGreaterThan(10)
  for (const file of files) expect(await readFile(file, 'utf8'), file).not.toMatch(legacy)
})
