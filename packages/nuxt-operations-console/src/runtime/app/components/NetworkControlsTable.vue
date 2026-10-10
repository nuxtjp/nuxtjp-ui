<script setup lang="ts">
import { useId } from 'vue'
import {
  decisionDisplayStatus,
  formatTimestamp,
  type NetworkControlDecision,
  type NetworkControlReceipt,
  type OperationsConsoleLabels,
  type OperationsLocale
} from '../../core'
import StatusPill from './StatusPill.vue'

defineProps<{
  decisions: NetworkControlDecision[]
  receipts: NetworkControlReceipt[]
  labels: OperationsConsoleLabels
  locale: OperationsLocale
  now: number
}>()
const titleId = useId()
</script>

<template>
  <section class="njo-section" :aria-labelledby="titleId">
    <h2 :id="titleId">{{ labels.controls }}</h2>
    <p>{{ labels.dryRunNotice }}</p>
    <div v-if="decisions.length" class="njo-control-grid">
      <article v-for="decision in decisions" :key="decision.id">
        <div class="njo-control-heading">
          <strong>{{ decision.target_id }}</strong>
          <StatusPill :status="decisionDisplayStatus(decision, now)" :locale="locale" />
        </div>
        <dl>
          <div><dt>{{ labels.action }}</dt><dd>{{ decision.action }}</dd></div>
          <div><dt>{{ labels.decision }}</dt><dd>{{ decision.reason_code }}</dd></div>
        </dl>
        <ul class="njo-receipts">
          <li
            v-for="receipt in receipts.filter(item => item.decision_id === decision.id)"
            :key="receipt.id"
          >
            <StatusPill :status="receipt.status" :locale="locale" />
            <span>{{ labels.result }}: {{ receipt.result_code }}</span>
            <time :datetime="receipt.recorded_at">
              {{ formatTimestamp(receipt.recorded_at, locale) }}
            </time>
          </li>
        </ul>
      </article>
    </div>
    <p v-else class="njo-empty">{{ labels.none }}</p>
  </section>
</template>
