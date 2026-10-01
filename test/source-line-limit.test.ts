import { readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const roots = ['.']
const sourceExtensions = new Set(['.css', '.mjs', '.ts', '.vue'])
const ignoredDirectories = new Set([
  '.git', '.nuxt', '.output', 'coverage', 'dist', 'node_modules', 'vendor'
])

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      return ignoredDirectories.has(entry.name) ? [] : sourceFiles(path)
    }
    return sourceExtensions.has(extname(entry.name)) ? [path] : []
  })
}

function nonCommentLines(source: string): number {
  let closingMarker: '*/' | '-->' | null = null
  function stripBlockComments(line: string): string {
    let content = ''
    let cursor = 0
    while (cursor < line.length) {
      if (closingMarker) {
        const end = line.indexOf(closingMarker, cursor)
        if (end < 0) break
        cursor = end + closingMarker.length
        closingMarker = null
        continue
      }
      const slash = line.indexOf('/*', cursor)
      const html = line.indexOf('<!--', cursor)
      const start = slash < 0 ? html : html < 0 ? slash : Math.min(slash, html)
      if (start < 0) return content + line.slice(cursor)
      content += line.slice(cursor, start)
      closingMarker = start === slash ? '*/' : '-->'
      cursor = start + (closingMarker === '*/' ? 2 : 4)
    }
    return content
  }
  return source.split('\n').filter((line) => {
    const content = stripBlockComments(line).trim()
    return Boolean(content) && !content.startsWith('//')
  }).length
}

describe('source maintainability', () => {
  it('keeps every source file below 150 non-comment lines', () => {
    const violations = roots.flatMap(sourceFiles)
      .map(path => ({ path: relative(process.cwd(), path), lines: nonCommentLines(readFileSync(path, 'utf8')) }))
      .filter(result => result.lines >= 150)
    expect(violations).toEqual([])
  })
})
