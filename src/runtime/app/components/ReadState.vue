<script setup lang="ts">
import { computed } from 'vue'
import type { NuxtJpUiTransport } from '../../core'
import { useNuxtJpLocale } from '../composables/useNuxtJpLocale'

const props = withDefaults(defineProps<{
  transport: NuxtJpUiTransport
  pendingMessage?: string
  errorMessage?: string
  empty?: boolean
  emptyMessage?: string
}>(), { empty: false })
defineEmits<{ retry: [] }>()
const locale = useNuxtJpLocale()
const text = computed(() => locale.value === 'en' ? {
  pendingTitle: 'Checking', pending: 'Checking the current state.',
  errorTitle: 'State unavailable', error: 'The current state could not be retrieved.',
  emptyTitle: 'No items', empty: 'There is no applicable data.', retry: 'Retry'
} : {
  pendingTitle: '確認中', pending: '最新状態を確認しています。',
  errorTitle: '状態を取得できません', error: '現在状態を取得できません。',
  emptyTitle: '対象なし', empty: '対象データはありません。', retry: '再試行'
})
</script>

<template>
  <UEmpty v-if="transport === 'loading'" loading :title="text.pendingTitle"
    :description="props.pendingMessage ?? text.pending" variant="naked"
    role="status" aria-live="polite" />
  <UAlert v-else-if="transport === 'error'" color="error" variant="subtle"
    :title="text.errorTitle" :description="props.errorMessage ?? text.error" role="alert">
    <template #actions><UButton color="error" variant="soft" @click="$emit('retry')">
      {{ text.retry }}
    </UButton></template>
  </UAlert>
  <UEmpty v-else-if="empty" :title="text.emptyTitle"
    :description="props.emptyMessage ?? text.empty" variant="outline" />
  <slot v-else />
</template>
