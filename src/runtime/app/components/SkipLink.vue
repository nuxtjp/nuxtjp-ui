<script setup lang="ts">
withDefaults(defineProps<{ target?: string, label?: string }>(), {
  target: '#main-content', label: '本文へ移動'
})
</script>

<template><a :href="target" class="nuxtjp-skip-link">{{ label }}</a></template>
