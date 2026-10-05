import {
  addComponentsDir,
  addImportsDir,
  createResolver,
  defineNuxtModule
} from '@nuxt/kit'
import { icons as lucideIcons } from '@iconify-json/lucide'
import type { ModuleOptions as NuxtIconOptions } from '@nuxt/icon'
import type { NuxtModule } from '@nuxt/schema'

export interface ModuleOptions {
  locale: 'ja' | 'en'
}

const nuxtJpUiModule: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@nuxtjp/ui',
    configKey: 'nuxtJpUi',
    compatibility: { nuxt: '^4.5.2' }
  },
  defaults: { locale: 'ja' },
  moduleDependencies(nuxt) {
    const uiOptions = isRecord(nuxt.options.ui) ? nuxt.options.ui : {}
    nuxt.options.ui = { ...uiOptions, fonts: false }
    return {
      '@nuxt/ui': {
        version: '^4.11.3',
        overrides: { fonts: false }
      },
      '@nuxt/icon': {
        version: '^2.5.1',
        overrides: {
          customCollections: mergeIconCollections(nuxt.options.icon)
        }
      }
    }
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    addComponentsDir({
      path: resolver.resolve('./runtime/app/components'),
      prefix: 'NuxtJp',
      pathPrefix: false
    })
    addImportsDir(resolver.resolve('./runtime/app/composables'))
    const stylesheet = resolver.resolve('./runtime/app/assets/nuxtjp-ui.css')
    if (!nuxt.options.css.includes(stylesheet)) nuxt.options.css.push(stylesheet)
    const appConfig = nuxt.options.appConfig as Record<string, unknown>
    const current = isRecord(appConfig.nuxtJpUi) ? appConfig.nuxtJpUi : {}
    appConfig.nuxtJpUi = { locale: options.locale, ...current }
    appConfig.ui = mergeUiDefaults(appConfig.ui)
  }
})

export default nuxtJpUiModule

function mergeUiDefaults(value: unknown): Record<string, unknown> {
  const current = isRecord(value) ? value : {}
  const colors = isRecord(current.colors) ? current.colors : {}
  return {
    ...current,
    colors: {
      primary: 'blue', secondary: 'cyan', success: 'green', info: 'sky',
      warning: 'amber', error: 'red', neutral: 'neutral', ...colors
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function mergeIconCollections(
  value: unknown
): NonNullable<NuxtIconOptions['customCollections']> {
  const iconOptions = isRecord(value) ? value : {}
  const configured = Array.isArray(iconOptions.customCollections)
    ? iconOptions.customCollections as NonNullable<NuxtIconOptions['customCollections']> : []
  return [
    lucideIcons,
    ...configured.filter(collection => !isRecord(collection) || collection.prefix !== 'lucide')
  ]
}
