<script setup lang="ts">
import StatusBadge from './StatusBadge.vue'
import type { ResourceLinkage } from '../../shared/types'

defineProps<{
  title: string
  emptyLabel: string
  linkages: ResourceLinkage[]
}>()
</script>

<template>
  <section class="nj-connections">
    <div class="nj-section-heading">
      <h3>{{ title }}</h3>
      <span>{{ linkages.length }} connections</span>
    </div>
    <p v-if="linkages.length === 0" class="nj-empty-inline">
      {{ emptyLabel }}
    </p>
    <ul v-else class="nj-connection-list">
      <li v-for="linkage in linkages" :key="linkage.id">
        <div>
          <strong>{{ linkage.other_resource_name }}</strong>
          <small>{{ linkage.interface_kind }}</small>
        </div>
        <div class="nj-connection-statuses">
          <StatusBadge :status="linkage.contract_status" label="contract" />
          <StatusBadge :status="linkage.machine_status" label="machine" />
          <StatusBadge :status="linkage.human_review_status" label="human" />
          <StatusBadge :status="linkage.overall_status" label="overall" />
        </div>
      </li>
    </ul>
  </section>
</template>
