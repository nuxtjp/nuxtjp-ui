<script setup lang="ts">
import { computed, useId } from 'vue'
import {
  isControlCoverageDocument,
  resolveControlCoverageLabels,
  summarizeControlCoverage,
  type ControlCoverageDocument,
  type ControlCoverageLabels,
  type OperationsLocale
} from '../../core'
import { immutableSnapshot } from '../../core/snapshot'
import { useReactiveNow } from '../composables/useReactiveNow'
import ControlCoverageList from './ControlCoverageList.vue'
import ControlCoverageSummary from './ControlCoverageSummary.vue'

const props = withDefaults(defineProps<{
  document: unknown
  locale?: OperationsLocale
  labels?: Partial<ControlCoverageLabels>
}>(), { locale: 'ja', labels: () => ({}) })
const labels = computed(() =>
  resolveControlCoverageLabels(props.locale, props.labels))
const now = useReactiveNow()
const document = computed<ControlCoverageDocument | undefined>(() =>
  isControlCoverageDocument(props.document)
    ? immutableSnapshot(props.document)
    : undefined
)
const summary = computed(() =>
  document.value
    ? summarizeControlCoverage(document.value, now.value)
    : undefined
)
const titleId = useId()
</script>

<template>
  <section class="njo-coverage-panel" :aria-labelledby="titleId">
    <p v-if="!document || !summary" class="njo-alert" role="alert">
      {{ labels.invalid }}
    </p>
    <template v-else>
      <header class="njo-coverage-header">
        <p class="njo-kicker">CROWSI / CONTROL COVERAGE V2</p>
        <h2 :id="titleId">{{ labels.heading }}</h2>
        <p>{{ labels.description }}</p>
      </header>
      <p v-if="summary.stale" class="njo-alert" role="status">{{ labels.stale }}</p>
      <ControlCoverageSummary
        :summary="summary"
        :generated-at="document.generated_at_epoch_s"
        :labels="labels"
        :locale="locale"
      />
      <ControlCoverageList
        :items="document.assets"
        :generated-at="document.generated_at_epoch_s"
        :labels="labels"
        :locale="locale"
        :now="now"
      />
    </template>
  </section>
</template>
