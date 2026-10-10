import { fileURLToPath } from 'node:url'
import { defineNuxtConfig } from 'nuxt/config'

const stylesheet = fileURLToPath(
  new URL('./app/assets/management-layout.css', import.meta.url)
)

export default defineNuxtConfig({
  compatibilityDate: '2026-07-27',
  modules: ['@nuxtjp/ui'],
  css: [stylesheet],
  devtools: { enabled: false },
  vite: { build: { rollupOptions: { checks: { pluginTimings: false } } } },
  typescript: { strict: true, typeCheck: true }
})
