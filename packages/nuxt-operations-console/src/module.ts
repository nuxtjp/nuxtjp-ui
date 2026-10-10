import {
  addComponent,
  addImports,
  createResolver,
  defineNuxtModule
} from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'

export interface ModuleOptions {
  componentPrefix: string
}

const operationsConsoleModule: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@nuxtjp/operations-console',
    configKey: 'nuxtJpOperationsConsole',
    compatibility: { nuxt: '^4.5.0' }
  },
  defaults: {
    componentPrefix: 'NuxtJp'
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    for (const component of [
      'OperationsConsole',
      'CredentialReadinessPanel',
      'NetworkObservationsPanel',
      'NetworkControlsPanel',
      'ControlCoveragePanel',
      'NetworkTopologyPanel'
    ]) {
      addComponent({
        name: `${options.componentPrefix}${component}`,
        filePath: resolver.resolve(`./runtime/app/components/${component}.vue`)
      })
    }
    addImports({
      name: 'useOperationsConsole',
      from: resolver.resolve('./runtime/app/composables/useOperationsConsole')
    })
    const stylesheet = resolver.resolve('./runtime/app/assets/operations-console.css')
    if (!nuxt.options.css.includes(stylesheet)) nuxt.options.css.push(stylesheet)
  }
})

export default operationsConsoleModule
