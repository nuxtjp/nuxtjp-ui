<script setup lang="ts">
import { useId } from 'vue'
import {
  formatLatency,
  formatTimestamp,
  observationDisplayStatus,
  type NetworkObservation,
  type OperationsConsoleLabels,
  type OperationsLocale
} from '../../core'
import StatusPill from './StatusPill.vue'

defineProps<{
  items: NetworkObservation[]
  labels: OperationsConsoleLabels
  locale: OperationsLocale
  now: number
}>()
const titleId = useId()
</script>

<template>
  <section class="njo-section" :aria-labelledby="titleId">
    <h2 :id="titleId">{{ labels.networks }}</h2>
    <div v-if="items.length" class="njo-table-scroll" tabindex="0">
      <table>
        <thead>
          <tr>
            <th scope="col">{{ labels.status }}</th>
            <th scope="col">{{ labels.target }}</th>
            <th scope="col">{{ labels.protocol }}</th>
            <th scope="col">{{ labels.latency }}</th>
            <th scope="col">{{ labels.observedAt }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td><StatusPill :status="observationDisplayStatus(item, now)" :locale="locale" /></td>
            <th scope="row">{{ item.label }}<small>{{ item.zone }}</small></th>
            <td>{{ item.protocol }}</td>
            <td>{{ formatLatency(item.latency_ms) }}</td>
            <td>{{ formatTimestamp(item.observed_at, locale) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="njo-empty">{{ labels.none }}</p>
  </section>
</template>
