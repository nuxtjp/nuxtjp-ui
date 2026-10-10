<script setup lang="ts">
import { computed } from 'vue'
import {
  statusLabel,
  statusTone,
  type OperationsLocale
} from '../../core'

const props = defineProps<{
  status: string
  locale: OperationsLocale
}>()
const text = computed(() => statusLabel(props.status, props.locale))
const tone = computed(() => statusTone(props.status))
</script>

<template>
  <span class="njo-status" :data-tone="tone">{{ text }}</span>
</template>

