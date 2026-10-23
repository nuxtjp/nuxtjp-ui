import { fileURLToPath } from 'node:url'
import { createPage, setup, $fetch } from '@nuxt/test-utils/e2e'
import { expect } from '@playwright/test'
import { describe, it } from 'vitest'

describe('reviewed upstream changes against the existing Vue candidates', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
    server: true,
    browser: true,
    browserOptions: { type: 'chromium' }
  })

  it('registers prefixed components and Japanese locale in SSR', async () => {
    const html = await $fetch('/')
    for (const marker of ['lang="ja"', 'NuxtJP UI fixture', '確認済み', '準備内容', '現在', 'i-lucide:shield-check']) {
      expect(html).toContain(marker)
    }
    expect(html).not.toContain('icon-fallback')
  })

  it('supports keyboard navigation, visible focus, disabled steps and live progress', async () => {
    const page = await createPage('/')
    try {
      await page.keyboard.press('Tab')
      const skip = page.getByRole('link', { name: '本文へ移動' })
      await expect(skip).toBeFocused()
      await expect(skip).toBeInViewport()
      const outline = await skip.evaluate(element => getComputedStyle(element).outlineStyle)
      expect(outline).not.toBe('none')
      await page.keyboard.press('Enter')
      await expect(page.getByRole('main')).toBeFocused()
      const previous = page.getByRole('button', { name: '前の手順', exact: true })
      const next = page.getByRole('button', { name: '次の手順', exact: true })
      await expect(previous).toBeDisabled()
      await next.focus()
      await page.keyboard.press('Enter')
      await expect(page.getByText('接続内容', { exact: true })).toBeVisible()
      await expect(page.locator('[aria-live="polite"]').filter({ hasText: '手順 2 / 3' })).toBeVisible()
      await expect(next).toBeDisabled()
      await previous.focus()
      await page.keyboard.press('Space')
      await expect(page.getByText('準備内容', { exact: true })).toBeVisible()
    } finally { await page.close() }
  })

  it('compiles the published v2 tokens through the real Tailwind and Nuxt UI import order', async () => {
    const page = await createPage('/')
    try {
      const styles = await page.getByTestId('theme-proof').evaluate(element => {
        const style = getComputedStyle(element)
        return { background: style.backgroundColor, lineHeight: style.lineHeight, fontSize: style.fontSize }
      })
      const alpha = Number(/rgba\(0, 0, 0, ([\d.]+)\)/.exec(styles.background)?.[1])
      // CSSOM may serialize an 8-bit quantized alpha; .54 must still fail.
      expect(alpha).toBeGreaterThanOrEqual(0.535)
      expect(alpha).toBeLessThanOrEqual(0.538)
      expect(parseFloat(styles.lineHeight) / parseFloat(styles.fontSize)).toBeCloseTo(1.7)
    } finally { await page.close() }
  })

  it('exposes named states and description terms in the browser accessibility tree', async () => {
    const page = await createPage('/')
    try {
      await expect(page.getByRole('alert')).toContainText('状態を取得できません')
      await expect(page.getByRole('status').filter({ hasText: '確認中' })).toBeVisible()
      await expect(page.getByRole('term')).toHaveText('接続先')
      await expect(page.getByRole('definition')).toHaveText('公開API')
      const tree = await page.getByRole('main').ariaSnapshot()
      expect(tree).toContain('heading "NuxtJP UI fixture"')
      expect(tree).toContain('確認済み')
      expect(tree).toContain('再試行')
    } finally { await page.close() }
  })

  it('keeps key content visible at narrow widths and CSS enlargement', async () => {
    const page = await createPage('/')
    try {
      for (const width of [320, 768, 1280]) {
        await page.setViewportSize({ width, height: 900 })
        for (const zoom of [1, 2, 4]) {
          await page.evaluate(value => { document.documentElement.style.zoom = String(value) }, zoom)
          await expect(page.getByRole('heading', { name: 'NuxtJP UI fixture' })).toBeVisible()
          await expect(page.getByRole('term')).toBeVisible()
          await expect(page.getByRole('button', { name: '次の手順', exact: true })).toBeVisible()
          await expect(page.getByRole('definition')).toHaveText('公開API')
        }
      }
      await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
      await page.evaluate(() => { document.documentElement.style.zoom = '1' })
      await page.getByRole('button', { name: '再試行', exact: true }).focus()
      await expect(page.getByRole('button', { name: '再試行', exact: true })).toBeFocused()
    } finally { await page.close() }
  })
})
