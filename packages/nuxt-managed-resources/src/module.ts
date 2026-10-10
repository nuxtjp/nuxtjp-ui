import {
  addComponentsDir,
  addImports,
  addImportsDir,
  createResolver,
  defineNuxtModule
} from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'

export interface ModuleOptions {
  componentPrefix: string
}

const managedResourcesModule: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@nuxtjp/managed-resources',
    configKey: 'nuxtJpManagedResources',
    compatibility: {
      nuxt: '^4.5.0'
    }
  },
  defaults: {
    componentPrefix: 'NuxtJp'
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    addComponentsDir({
      path: resolver.resolve('./runtime/app/components'),
      prefix: options.componentPrefix,
      pathPrefix: false
    })
    addImportsDir(resolver.resolve('./runtime/app/composables'))
    addImports([
      {
        name: 'isManagedResourcesDocument',
        from: resolver.resolve('./runtime/shared/guards')
      },
      {
        name: 'isManagedResourceDetailDocument',
        from: resolver.resolve('./runtime/shared/guards')
      }
    ])

    const stylesheet = resolver.resolve('./runtime/app/assets/managed-resources.css')
    if (!nuxt.options.css.includes(stylesheet)) {
      nuxt.options.css.push(stylesheet)
    }
  }
})

export default managedResourcesModule
