<script setup lang="ts">
import type {
  OperationsConsoleLabels,
  OperationsSummary
} from '../../core'

defineProps<{
  summary: OperationsSummary
  labels: OperationsConsoleLabels
}>()
</script>

<template>
  <dl class="njo-summary" :aria-label="labels.heading">
    <div>
      <dt>{{ labels.credentials }}</dt>
      <dd>{{ summary.credentialReady }} / {{ summary.credentialTotal }}</dd>
      <small>{{ summary.credentialAttention }} {{ labels.attention }}</small>
    </div>
    <div>
      <dt>{{ labels.networks }}</dt>
      <dd>{{ summary.networkHealthy }} / {{ summary.networkTotal }}</dd>
      <small>{{ summary.networkAttention }} {{ labels.attention }}</small>
    </div>
    <div>
      <dt>{{ labels.controls }}</dt>
      <dd>{{ summary.receiptRecorded }} / {{ summary.receiptTotal }}</dd>
      <small>
        {{ summary.decisionDenied + summary.decisionExpired }} {{ labels.attention }}
      </small>
    </div>
    <div>
      <dt>{{ labels.stale }}</dt>
      <dd>{{ summary.staleDocumentCount }}</dd>
      <small>{{ labels.attention }}</small>
    </div>
  </dl>
</template>
