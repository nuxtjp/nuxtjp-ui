<script setup lang="ts">
const items = [
  { label: '一次情報', value: 13 },
  { label: '追跡要件', value: 27 },
  { label: 'DADSコンポーネント', value: 49 }
]
</script>

<template>
  <NuxtJpPageHeader eyebrow="NUXTJP UI" title="基礎UI playground"
    description="themeと汎用部品をlayoutや業務実装から独立して確認します。" />
  <NuxtJpReadState transport="ready">
    <NuxtJpMetricGrid title="適合性台帳" :items="items" />
    <NuxtJpCopyField class="mt-6" text="pnpm add @nuxtjp/ui" />
  </NuxtJpReadState>
</template>
