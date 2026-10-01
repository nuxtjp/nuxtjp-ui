<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ eyebrow?: string, title: string, description?: string }>()
const headerProps = computed(() => ({
  title: props.title,
  ...(props.eyebrow ? { headline: props.eyebrow } : {}),
  ...(props.description ? { description: props.description } : {})
}))
</script>

<template>
  <UPageHeader
    as="header"
    class="mb-6"
    v-bind="headerProps"
  />
</template>
