<script setup lang="ts">
import type { ManagementSummaryItem } from '../../core'

const props = defineProps<{ item: ManagementSummaryItem }>()
defineEmits<{ retry: [id: string], action: [id: string] }>()
const locale = useNuxtJpLocale()
const actionLabels = {
  ja: {
    available: { label: '操作可能', color: 'success' as const },
    blocked: { label: '操作停止', color: 'error' as const },
    busy: { label: '処理中', color: 'info' as const },
    'read-only': { label: '閲覧専用', color: 'neutral' as const }
  },
  en: {
    available: { label: 'Available', color: 'success' as const },
    blocked: { label: 'Blocked', color: 'error' as const },
    busy: { label: 'In progress', color: 'info' as const },
    'read-only': { label: 'Read only', color: 'neutral' as const }
  }
} as const
const actionPresentation = computed(() => actionLabels[locale.value]
  [props.item.status.dimensions.action])
const actionVisible = computed(() => props.item.primaryAction && !props.item.primaryAction.disabled)
const text = computed(() => locale.value === 'en' ? {
  diagnostics: 'Diagnostics', disabled: 'Review the action prerequisites.',
  prerequisite: 'Review prerequisites', source: 'Source', observed: 'Observed',
  unavailable: 'Unavailable', stale: 'Stale'
} : {
  diagnostics: '診断情報', disabled: '操作の前提条件を確認してください。',
  prerequisite: '前提条件を確認', source: 'データ源', observed: '観測時点',
  unavailable: '未取得', stale: '要更新'
})
</script>

<template>
  <UCard variant="outline" :role="item.status.state === 'error' ? 'alert' : undefined">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0"><p class="text-xs text-muted">{{ item.domain }}</p>
          <h2 class="text-lg font-semibold text-highlighted">{{ item.title }}</h2></div>
        <div class="flex flex-wrap gap-2">
          <NuxtJpStatusBadge :label="item.status.label" :color="item.status.color" />
          <NuxtJpStatusBadge :label="actionPresentation.label"
            :color="actionPresentation.color" />
          <NuxtJpStatusBadge v-if="item.status.stale" :label="text.stale" color="warning" />
        </div>
      </div>
    </template>
    <p class="text-sm text-muted">{{ item.description }}</p>
    <p class="mt-2 text-sm text-default">{{ item.status.summary }}</p>
    <dl class="mt-3 grid gap-2 text-xs text-muted sm:grid-cols-2">
      <div><dt class="font-semibold text-default">{{ text.source }}</dt>
        <dd>{{ item.sourceLabel ?? text.unavailable }}</dd></div>
      <div><dt class="font-semibold text-default">{{ text.observed }}</dt>
        <dd><time v-if="item.status.observedAt" :datetime="item.status.observedAt">
          {{ item.status.observedAt }}
        </time><span v-else>{{ text.unavailable }}</span></dd></div>
    </dl>
    <NuxtJpMetricGrid v-if="item.metrics.length" :items="item.metrics" />
    <UCollapsible v-if="item.status.reasonCodes.length" class="mt-4">
      <template #default="{ open }"><UButton color="neutral" variant="ghost" size="sm"
        :trailing-icon="open ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'">
        {{ text.diagnostics }}
      </UButton></template>
      <template #content><ul class="mt-2 space-y-1 text-xs text-muted">
        <li v-for="reason in item.status.reasonCodes" :key="reason"><code>{{ reason }}</code></li>
      </ul></template>
    </UCollapsible>
    <template v-if="item.primaryAction" #footer>
      <UButton v-if="actionVisible && item.primaryAction.kind === 'navigate'"
        :to="item.primaryAction.to" color="primary" variant="soft">
        {{ item.primaryAction.label }}
      </UButton>
      <UButton v-else-if="actionVisible && item.primaryAction.kind === 'retry'"
        color="neutral" variant="outline" @click="$emit('retry', item.id)">
        {{ item.primaryAction.label }}
      </UButton>
      <UButton v-else-if="actionVisible" color="primary" variant="soft"
        @click="$emit('action', item.id)">{{ item.primaryAction.label }}</UButton>
      <div v-else class="grid gap-2 text-sm">
        <p class="text-muted">{{ item.primaryAction.disabledReason ?? text.disabled }}</p>
        <UButton v-if="item.primaryAction.prerequisiteTo"
          :to="item.primaryAction.prerequisiteTo" color="neutral" variant="link"
          class="w-fit p-0">{{ item.primaryAction.prerequisiteLabel ?? text.prerequisite }}</UButton>
      </div>
    </template>
  </UCard>
</template>
