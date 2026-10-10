import operationsConsole from '../src/module'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: [[operationsConsole, { componentPrefix: 'NuxtJp' }]]
})
