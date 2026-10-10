<script setup lang="ts">
import { computed } from 'vue'
import { statusTone } from '../../shared/resources'

const props = defineProps<{
  status: string
  label?: string
}>()

const tone = computed(() => statusTone(props.status))
</script>

<template>
  <span
    class="nj-status"
    :class="`nj-status--${tone}`"
    :data-status="status"
  >
    <span class="nj-status__dot" aria-hidden="true" />
    {{ label || status }}
  </span>
</template>

