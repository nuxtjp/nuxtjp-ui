import type { NuxtJpManagementLayoutConfig } from '../core/config'

const nuxtJpManagementLayout: NuxtJpManagementLayoutConfig = {
  brand: { name: 'Management', shortName: 'Management', mark: 'M', home: '/' },
  routes: [],
  navigation: [],
  storageKey: 'nuxtjp-management-layout-navigation',
  contentWidth: 'wide'
}

export default defineAppConfig({
  nuxtJpUi: { locale: 'ja' },
  nuxtJpManagementLayout
})
