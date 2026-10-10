import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

describe('NuxtJP management Layer boundary', () => {
  it('publishes an npm Layer and depends on the UI module contract', () => {
    const manifest = JSON.parse(source('package.json'))
    expect(manifest.main).toBe('./nuxt.config.ts')
    expect(manifest.peerDependencies['@nuxtjp/ui']).toBe('0.1.0')
    expect(manifest.devDependencies['@nuxtjp/ui'])
      .toBe('0.1.0')
    expect(manifest.repository.url).toContain('nuxtjp/nuxtjp-ui')
    expect(manifest.repository.directory).toBe('packages/nuxt-management-layout')
    expect(source('nuxt.config.ts')).toMatch(/modules:\s*\['@nuxtjp\/ui'\]/u)
    expect(source('playground/nuxt.config.ts'))
      .toMatch(/extends:\s*\['@nuxtjp\/management-layout'\]/u)
  })

  it('owns the shell but no business route', () => {
    const config = source('app/app.config.ts')
    const layout = source('app/layouts/default.vue')
    expect(config).toMatch(/routes:\s*\[\]/u)
    expect(layout).toContain('<NuxtJpSkipLink')
    expect(layout).toContain('id="management-main"')
    expect(`${config}\n${layout}`).not.toMatch(/Coela|Crowsi|GitHub|Policy Authority/u)
  })

  it('does not own Nuxt UI or DADS theme dependencies', () => {
    const manifest = JSON.parse(source('package.json'))
    expect(manifest.dependencies?.['@nuxt/ui']).toBeUndefined()
    expect(manifest.dependencies?.['@digital-go-jp/tailwind-theme-plugin']).toBeUndefined()
    expect(source('app/assets/management-layout.css')).not.toContain('@import')
  })

  it('shows source, observation and stale state without owning their values', () => {
    const summary = source('app/components/NuxtJpManagementStatusSummary.vue')
    expect(summary).toContain('item.sourceLabel')
    expect(summary).toContain('item.status.observedAt')
    expect(summary).toContain('item.status.stale')
    expect(summary).toContain('<time')
  })

  it('renders footer perspectives as a management-session menu', () => {
    const layout = source('app/layouts/default.vue')
    const menu = source('app/components/NuxtJpManagementSessionMenu.vue')
    expect(layout).toContain('<NuxtJpManagementSessionMenu')
    expect(layout).toContain(`:key="perspective?.id ?? 'default'"`)
    expect(menu).toContain('<UPopover')
    expect(menu).toContain('aria-label="管理セッションと表示レイヤー"')
    expect(menu).toContain('aria-label="表示レイヤー"')
    expect(menu).toContain('<NuxtLink v-for="item in items"')
    expect(menu).toContain('watch(() => route.fullPath')
  })
})
