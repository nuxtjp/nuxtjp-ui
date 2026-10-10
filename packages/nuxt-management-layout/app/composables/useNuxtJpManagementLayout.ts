import {
  managementBreadcrumbs,
  managementPerspectiveFor,
  managementPerspectiveNavigation,
  managementRouteFor,
  resolveManagementLayoutConfig
} from '../../core'
import type { ManagementDynamicNavigationGroup } from '../../core'

export function useNuxtJpManagementLayout() {
  const appConfig = useAppConfig()
  const route = useRoute()
  const config = computed(() => resolveManagementLayoutConfig(
    appConfig.nuxtJpManagementLayout
  ))
  const dynamicNavigation = useState<ManagementDynamicNavigationGroup[]>(
    'nuxtjp-management-layout:dynamic-navigation', () => [])
  const currentRoute = computed(() => managementRouteFor(config.value.routes, route.path))
  const perspective = computed(() => managementPerspectiveFor(config.value, route.path))
  const navigation = computed(() => managementPerspectiveNavigation(
    config.value, route.fullPath, dynamicNavigation.value))
  const breadcrumbs = computed(() => managementBreadcrumbs(config.value.routes, route.path))
  const title = computed(() => currentRoute.value?.title ?? config.value.brand.name)
  useHead(() => ({
    title: currentRoute.value
      ? `${currentRoute.value.title} | ${config.value.brand.name}`
      : config.value.brand.name
  }))
  return { config, currentRoute, perspective, navigation, breadcrumbs, title }
}

export function useNuxtJpManagementNavigationExtensions() {
  const groups = useState<ManagementDynamicNavigationGroup[]>(
    'nuxtjp-management-layout:dynamic-navigation', () => [])
  function setExtension(value: ManagementDynamicNavigationGroup) {
    groups.value = [...groups.value.filter(group => group.groupId !== value.groupId), value]
  }
  function removeExtension(groupId: string) {
    groups.value = groups.value.filter(group => group.groupId !== groupId)
  }
  return { groups: readonly(groups), setExtension, removeExtension }
}
