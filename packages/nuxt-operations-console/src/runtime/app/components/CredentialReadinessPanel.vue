<script setup lang="ts">
import { computed } from 'vue'
import {
  isCredentialReadinessDocument,
  isFreshProjection,
  resolveLabels,
  type CredentialReadinessDocument,
  type OperationsConsoleLabels,
  type OperationsLocale
} from '../../core'
import { immutableSnapshot } from '../../core/snapshot'
import { useReactiveNow } from '../composables/useReactiveNow'
import CredentialReadinessTable from './CredentialReadinessTable.vue'

const props = withDefaults(defineProps<{
  document: unknown
  locale?: OperationsLocale
  labels?: Partial<OperationsConsoleLabels>
}>(), { locale: 'ja', labels: () => ({}) })
const labels = computed(() => resolveLabels(props.locale, props.labels))
const now = useReactiveNow()
const document = computed<CredentialReadinessDocument | undefined>(() =>
  isCredentialReadinessDocument(props.document)
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
      <CredentialReadinessTable
        :items="document.credentials"
        :labels="labels"
        :locale="locale"
        :now="now"
      />
    </template>
  </div>
</template>
