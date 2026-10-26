import { defineNuxtConfig } from 'nuxt/config'
import contactForm from '../../../packages/nuxt-contact-form/dist/module.mjs'
export default defineNuxtConfig({
 modules: [contactForm],
 compatibilityDate: '2026-10-27',
 devtools: { enabled: false },
 contactForm: {
  mode: 'live', endpoint: 'https://api.example.com/v1/submissions',
  siteKey: 'fixture', turnstileSiteKey: 'test-only',
  policyVersion: 'urn:coela:legal:fixture:policy@' + 'a'.repeat(40), privacyUrl: '/privacy/'
 }
})
