import type { NuxtJpUiColor } from '@nuxtjp/ui/core'
import { validateManagementLayoutConfig } from './config-validation'

export type ManagementColor = NuxtJpUiColor
export type ManagementRouteMatch = 'exact' | 'prefix' | 'segments'

export interface ManagementBrand {
  name: string
  shortName?: string
  mark: string
  home: string
}

export interface ManagementRouteDefinition {
  id: string
  label: string
  title: string
  path: string
  match?: ManagementRouteMatch
  parentId?: string
  icon?: string
}

export interface ManagementNavigationGroup {
  id: string
  label: string
  routeIds: string[]
}

export interface ManagementPerspective {
  id: string
  label: string
  description: string
  home: string
  navigationGroupIds: string[]
}

export interface NuxtJpManagementLayoutConfig {
  brand: ManagementBrand
  routes: ManagementRouteDefinition[]
  navigation: ManagementNavigationGroup[]
  perspectives?: ManagementPerspective[]
  perspectivePlacement?: 'header' | 'footer'
  environment?: { label: string, color?: ManagementColor }
  footer?: { label: string, badge?: string }
  storageKey?: string
  contentWidth?: 'wide' | 'full'
}

export interface ResolvedManagementLayoutConfig {
  brand: ManagementBrand
  routes: ManagementRouteDefinition[]
  navigation: ManagementNavigationGroup[]
  perspectives: ManagementPerspective[]
  perspectivePlacement: 'header' | 'footer'
  environment: { label: string, color: ManagementColor } | null
  footer: { label: string, badge?: string } | null
  storageKey: string
  contentWidth: 'wide' | 'full'
}

export function resolveManagementLayoutConfig(
  value: NuxtJpManagementLayoutConfig
): ResolvedManagementLayoutConfig {
  validateManagementLayoutConfig(value)
  return {
    brand: { ...value.brand },
    routes: value.routes.map(route => ({ ...route, match: route.match ?? 'exact' })),
    navigation: value.navigation.map(group => ({ ...group, routeIds: [...group.routeIds] })),
    perspectives: (value.perspectives ?? []).map(perspective => ({ ...perspective,
      navigationGroupIds: [...perspective.navigationGroupIds] })),
    perspectivePlacement: value.perspectivePlacement ?? 'header',
    environment: value.environment ? { color: 'neutral', ...value.environment } : null,
    footer: value.footer ? { ...value.footer } : null,
    storageKey: value.storageKey ?? 'nuxtjp-management-layout-navigation',
    contentWidth: value.contentWidth ?? 'wide'
  }
}
