<script setup lang="ts">
import type { NuxtJpUiColor } from '../../core'

withDefaults(defineProps<{ label: string, color?: NuxtJpUiColor }>(), {
  color: 'neutral'
})
</script>

<template><UBadge :color="color" variant="subtle">{{ label }}</UBadge></template>
