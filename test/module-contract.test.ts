import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

describe('NuxtJP UI module boundary', () => {
  it('uses the official Nuxt module distribution shape', () => {
    const manifest = JSON.parse(source('package.json'))
    expect(manifest.name).toBe('@nuxtjp/ui')
    expect(manifest.main).toBe('./dist/module.mjs')
    expect(manifest.exports['.'].import).toBe('./dist/module.mjs')
    expect(manifest.typesVersions['*'].core).toEqual(['./dist/runtime/core/index.d.ts'])
    expect(manifest.files).toContain('dist')
    expect(manifest.files).toContain('SECURITY.md')
    expect(manifest.files).not.toContain('test')
    expect(manifest.files).not.toContain('scripts')
    expect(manifest.homepage).toBe('https://github.com/nuxtjp/nuxtjp-ui#readme')
    expect(manifest.bugs.url).toBe('https://github.com/nuxtjp/nuxtjp-ui/issues')
    expect(manifest.publishConfig).toEqual({ access: 'public', provenance: true })
    expect(manifest.dependencies['@nuxt/ui']).toBe('4.10.0')
    expect(manifest.dependencies['@nuxt/icon']).toBe('2.4.1')
    expect(manifest.dependencies['@iconify-json/lucide']).toBe('1.2.121')
    expect(manifest.dependencies['@digital-go-jp/tailwind-theme-plugin']).toBe('1.0.1')
  })

  it('declares Nuxt UI as a versioned module dependency', () => {
    const module = source('src/module.ts')
    expect(module).toMatch(/moduleDependencies[\s\S]*'@nuxt\/ui'/u)
    expect(module).toMatch(/version:\s*'\^4\.10\.0'/u)
    expect(module).toMatch(/'@nuxt\/icon'[\s\S]*customCollections/u)
    expect(module).toMatch(/overrides:\s*\{\s*fonts:\s*false\s*\}/u)
    expect(module).toContain('addComponentsDir')
    expect(module).toContain('addImportsDir')
  })

  it('uses the reviewed Tailwind v4 import order', () => {
    const css = source('src/runtime/app/assets/nuxtjp-ui.css')
    expect(css.indexOf("@import 'tailwindcss'"))
      .toBeLessThan(css.indexOf("@import '@digital-go-jp/tailwind-theme-plugin/v4'"))
    expect(css.indexOf("@import '@digital-go-jp/tailwind-theme-plugin/v4'"))
      .toBeLessThan(css.indexOf("@import '@nuxt/ui'"))
  })

  it('contains primitives but no layout, page, or product integration', () => {
    const module = source('src/module.ts')
    expect(module).not.toMatch(/addLayout|addPage|Coela|Crowsi|GitHub|Policy Authority/u)
    for (const component of [
      'App', 'PageHeader', 'MetricGrid', 'ProcessStepper', 'ReadState',
      'SkipLink', 'StatusBadge', 'CopyField'
    ]) {
      expect(() => source(`src/runtime/app/components/${component}.vue`)).not.toThrow()
    }
  })

  it('keeps toast progress opt-in so clock drift cannot produce invalid progress values', () => {
    const app = source('src/runtime/app/components/App.vue')
    expect(app).toMatch(/toasterProgress:\s*false/u)
    expect(app).toMatch(/:toaster="toaster"/u)
  })

  it('has no dependency on the former combined package or product code', () => {
    const governed = [
      source('package.json'), source('src/module.ts'), source('README.md'),
      source('src/runtime/app/components/ProcessStepper.vue')
    ].join('\n')
    expect(governed).not.toContain('nuxt-management-ui')
    expect(governed).not.toContain('@nuxtjp/management-ui')
    expect(governed).not.toMatch(/GitHubSetup|OperationalTopology|Coela/u)
  })
})
