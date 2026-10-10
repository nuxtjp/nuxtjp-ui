<script setup lang="ts">
import { useId } from 'vue'
import {
  credentialDisplayStatus,
  formatTimestamp,
  type CredentialReadiness,
  type OperationsConsoleLabels,
  type OperationsLocale
} from '../../core'
import StatusPill from './StatusPill.vue'

defineProps<{
  items: CredentialReadiness[]
  labels: OperationsConsoleLabels
  locale: OperationsLocale
  now: number
}>()
const titleId = useId()
</script>

<template>
  <section class="njo-section" :aria-labelledby="titleId">
    <h2 :id="titleId">{{ labels.credentials }}</h2>
    <div v-if="items.length" class="njo-table-scroll" tabindex="0">
      <table>
        <thead>
          <tr>
            <th scope="col">{{ labels.status }}</th>
            <th scope="col">{{ labels.provider }}</th>
            <th scope="col">{{ labels.purpose }}</th>
            <th scope="col">{{ labels.scope }}</th>
            <th scope="col">{{ labels.storage }}</th>
            <th scope="col">{{ labels.checkedAt }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td><StatusPill :status="credentialDisplayStatus(item, now)" :locale="locale" /></td>
            <th scope="row">{{ item.label }}<small>{{ item.provider }}</small></th>
            <td>{{ item.purpose }}</td>
            <td>
              {{ item.scope.tenant }} / {{ item.scope.service }}
              <small>{{ item.scope.audience }}</small>
            </td>
            <td>{{ item.store_kind }}</td>
            <td>{{ formatTimestamp(item.checked_at, locale) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="njo-empty">{{ labels.none }}</p>
  </section>
</template>
