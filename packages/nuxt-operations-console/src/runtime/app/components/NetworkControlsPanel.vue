<script setup lang="ts">
import { computed } from 'vue'
import {
  isFreshProjection,
  isNetworkControlsDocument,
  resolveLabels,
  type NetworkControlsDocument,
  type OperationsConsoleLabels,
  type OperationsLocale
} from '../../core'
import { immutableSnapshot } from '../../core/snapshot'
import { useReactiveNow } from '../composables/useReactiveNow'
import NetworkControlsTable from './NetworkControlsTable.vue'

const props = withDefaults(defineProps<{
  document: unknown
  locale?: OperationsLocale
  labels?: Partial<OperationsConsoleLabels>
}>(), { locale: 'ja', labels: () => ({}) })
const labels = computed(() => resolveLabels(props.locale, props.labels))
const now = useReactiveNow()
const document = computed<NetworkControlsDocument | undefined>(() =>
  isNetworkControlsDocument(props.document)
    ? immutableSnapshot(props.document)
    : undefined
)
const stale = computed(() =>
  document.value && !isFreshProjection(document.value.generated_at, now.value)
)
</script>

<template>
  <div>
    <p v-if="!document" class="njo-alert" role="alert">{{ labels.invalid }}</p>
    <template v-else>
      <p v-if="stale" class="njo-alert" role="status">{{ labels.stale }}</p>
      <NetworkControlsTable
        :decisions="document.decisions"
        :receipts="document.receipts"
        :labels="labels"
        :locale="locale"
        :now="now"
      />
    </template>
  </div>
</template>
