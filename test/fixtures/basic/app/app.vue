<script setup lang="ts">
const activeStep = ref('prepare')
const steps = [
  { value: 'prepare', slot: 'prepare', title: '準備', description: '前提を確認' },
  { value: 'connect', slot: 'connect', title: '接続', description: '接続を確認' },
  { value: 'verify', title: '検証', state: 'error' as const, disabled: true }
]
</script>

<template>
  <NuxtJpApp>
    <NuxtJpSkipLink />
    <main id="main-content" tabindex="-1" class="p-4">
      <NuxtJpPageHeader title="NuxtJP UI fixture" />
      <NuxtJpStatusBadge label="確認済み" color="success" />
      <UIcon name="i-lucide-shield-check" data-testid="bundled-lucide" />
      <NuxtJpProcessStepper v-model="activeStep" :items="steps">
        <template #prepare><p>準備内容</p></template>
        <template #connect><p>接続内容</p></template>
      </NuxtJpProcessStepper>
      <NuxtJpMetricGrid title="接続の概要" :items="[{ label: '接続先', value: '公開API' }]" />
      <NuxtJpReadState transport="loading" />
      <NuxtJpReadState transport="error" />
    </main>
  </NuxtJpApp>
</template>
