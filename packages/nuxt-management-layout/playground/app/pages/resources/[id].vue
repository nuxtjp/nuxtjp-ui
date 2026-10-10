<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <NuxtJpPageHeader eyebrow="DETAIL" title="リソース詳細"
    :description="`対象: ${String(route.params.id)}`" />
</template>
