<script setup lang="ts">
import {
  formatTimestamp,
  type ControlCoverageLabels,
  type ControlCoveragePresentation,
  type OperationsLocale
} from '../../core'
import StatusPill from './StatusPill.vue'

defineProps<{
  summary: ControlCoveragePresentation
  generatedAt: number
  labels: ControlCoverageLabels
  locale: OperationsLocale
}>()
</script>

<template>
  <dl class="njo-coverage-summary" :aria-label="labels.heading">
    <div>
      <dt>{{ labels.status }}</dt>
      <dd><StatusPill :status="summary.state" :locale="locale" /></dd>
    </div>
    <div>
      <dt>{{ labels.controlled }}</dt>
      <dd>{{ summary.controlledCount }} / {{ summary.assetCount }}</dd>
    </div>
    <div>
      <dt>{{ labels.gaps }}</dt>
      <dd>{{ summary.gapCount }}</dd>
    </div>
    <div>
      <dt>{{ labels.generatedAt }}</dt>
      <dd class="njo-coverage-time">{{ formatTimestamp(generatedAt, locale) }}</dd>
    </div>
  </dl>
</template>
