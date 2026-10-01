import { fileURLToPath } from 'node:url'
import { loadNuxt } from '@nuxt/kit'
import { describe, expect, it } from 'vitest'

describe('NuxtJP UI consumer installation', () => {
  it('installs local icons without the remote font module', async () => {
    const nuxt = await loadNuxt({
      cwd: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
      dev: false,
      ready: true,
      overrides: { devtools: { enabled: false } }
    })
    try {
      const installed = nuxt.options._installedModules.map(module => module.meta.name)
      expect(installed).toContain('@nuxt/icon')
      expect(installed).not.toContain('@nuxt/fonts')
      expect(nuxt.options.appConfig.icon?.customCollections).toContain('lucide')
      expect(nuxt.options.ui).toMatchObject({ fonts: false })
    } finally {
      await nuxt.close()
    }
  })
})
