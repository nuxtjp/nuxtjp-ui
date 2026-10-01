import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

describe('NuxtJP UI Nuxt module', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
    server: true
  })

  it('registers the prefixed components and Japanese locale in SSR', async () => {
    const html = await $fetch('/')
    expect(html).toContain('lang="ja"')
    expect(html).toContain('NuxtJP UI fixture')
    expect(html).toContain('確認済み')
    expect(html).toContain('準備内容')
    expect(html).toContain('現在')
    expect(html).toContain('i-lucide:shield-check')
    expect(html).not.toContain('icon-fallback')
  })
})
