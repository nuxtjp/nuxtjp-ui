<script setup lang="ts">
import type { NuxtJpUiMetric } from '../../core'

defineProps<{ title?: string, items: NuxtJpUiMetric[] }>()
</script>

<template>
  <section>
    <h3 v-if="title" class="mb-3 mt-6 text-sm font-semibold text-highlighted">
      {{ title }}
    </h3>
    <dl class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div v-for="item in items" :key="item.label" class="border border-default p-4">
        <dt class="text-xs text-muted">{{ item.label }}</dt>
        <dd class="mt-1 break-words font-semibold text-highlighted">{{ item.value }}</dd>
      </div>
    </dl>
  </section>
</template>
