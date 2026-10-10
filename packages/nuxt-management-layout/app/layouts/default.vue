<script setup lang="ts">
const { config, perspective, navigation, breadcrumbs, title } = useNuxtJpManagementLayout()
const locale = useNuxtJpLocale()
const labels = computed(() => locale.value === 'en'
  ? { skip: 'Skip to main content', navigation: 'Primary navigation' }
  : { skip: '本文へ移動', navigation: '主ナビゲーション' })
</script>

<template>
  <NuxtJpSkipLink target="#management-main" :label="labels.skip" />
  <UDashboardGroup class="nuxtjp-management-shell" :storage-key="config.storageKey">
    <UDashboardSidebar id="management-primary-navigation" :default-size="18"
      :min-size="14" :max-size="24" resizable>
      <template #header>
        <div class="nuxtjp-management-brand-stack">
          <NuxtLink :to="config.brand.home"
            class="flex min-w-0 items-center gap-3 font-semibold">
            <UAvatar :text="config.brand.mark" alt="" aria-hidden="true" size="sm" />
            <span class="truncate">{{ config.brand.shortName ?? config.brand.name }}</span>
          </NuxtLink>
          <NuxtJpManagementPerspectiveSwitcher
            v-if="config.perspectives.length && config.perspectivePlacement === 'header'"
            :items="config.perspectives" :active-id="perspective?.id"
            :description="perspective?.description" />
        </div>
      </template>
      <UNavigationMenu :key="perspective?.id ?? 'default'" :items="navigation"
        orientation="vertical" highlight
        color="primary" :aria-label="labels.navigation" class="w-full" />
      <template v-if="config.footer || config.perspectivePlacement === 'footer'" #footer>
        <div v-if="config.perspectives.length && config.perspectivePlacement === 'footer'"
          class="nuxtjp-management-footer-stack">
          <NuxtJpManagementSessionMenu :items="config.perspectives"
            :active-id="perspective?.id" :label="config.footer?.label ?? '管理セッション'"
            :badge="config.footer?.badge" />
        </div>
        <div v-else-if="config.footer" class="nuxtjp-management-footer-stack">
          <div class="flex items-center justify-between gap-2">
            <span class="truncate text-sm text-muted">{{ config.footer.label }}</span>
            <UBadge v-if="config.footer.badge" color="neutral" variant="subtle">
              {{ config.footer.badge }}
            </UBadge>
          </div>
        </div>
      </template>
    </UDashboardSidebar>
    <UDashboardPanel id="management-content">
      <template #header>
        <UDashboardNavbar :title="title">
          <template #leading><UDashboardSidebarToggle /></template>
          <template v-if="config.environment" #right>
            <UBadge :color="config.environment.color" variant="subtle">
              {{ config.environment.label }}
            </UBadge>
          </template>
        </UDashboardNavbar>
        <UDashboardToolbar v-if="breadcrumbs.length">
          <UBreadcrumb :items="breadcrumbs" />
        </UDashboardToolbar>
      </template>
      <template #body>
        <main id="management-main" tabindex="-1" class="mx-auto w-full p-4 sm:p-6 lg:p-8"
          :class="config.contentWidth === 'full' ? 'max-w-none' : 'max-w-7xl'">
          <slot />
        </main>
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
