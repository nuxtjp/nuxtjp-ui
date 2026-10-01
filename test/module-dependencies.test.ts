import type { Nuxt } from '@nuxt/schema'
import type { ModuleDependencies } from '@nuxt/schema'
import { describe, expect, it } from 'vitest'
import NuxtJpUi from '../src/module'

async function dependencies(icon: unknown = {}, ui: unknown = {}) {
  const nuxt = { options: { icon, ui } } as unknown as Nuxt
  const modules = await NuxtJpUi.getModuleDependencies?.(nuxt)
  return { modules, nuxt }
}

function dependency(resolved: ModuleDependencies | undefined, name: string) {
  const value = resolved?.[name]
  if (!value) throw new Error(`Missing required module dependency: ${name}`)
  return value
}

describe('NuxtJP UI infrastructure dependencies', () => {
  it('forces Nuxt UI remote font integration off', async () => {
    const { modules, nuxt } = await dependencies({}, { colorMode: false })
    expect(dependency(modules, '@nuxt/ui').overrides).toEqual({ fonts: false })
    expect(nuxt.options.ui).toEqual({ colorMode: false, fonts: false })
  })

  it('provides Lucide as a Nuxt Icon custom collection', async () => {
    const { modules } = await dependencies()
    const options = dependency(modules, '@nuxt/icon').overrides as Record<string, unknown>
    const collections = options.customCollections as Array<Record<string, unknown>>
    const lucide = collections.find(collection => collection.prefix === 'lucide')
    expect(lucide).toBeDefined()
    expect(lucide?.icons).toHaveProperty('shield-check')
  })

  it('preserves consumer collections without duplicating Lucide', async () => {
    const custom = { prefix: 'local', icons: { sample: { body: '<path/>' } } }
    const { modules } = await dependencies({ customCollections: [custom, { prefix: 'lucide' }] })
    const options = dependency(modules, '@nuxt/icon').overrides as Record<string, unknown>
    const collections = options.customCollections as Array<Record<string, unknown>>
    expect(collections.map(collection => collection.prefix)).toEqual(['lucide', 'local'])
  })
})
