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
    <main id="main-content">
      <NuxtJpPageHeader title="NuxtJP UI fixture" />
      <NuxtJpStatusBadge label="確認済み" color="success" />
      <UIcon name="i-lucide-shield-check" data-testid="bundled-lucide" />
      <NuxtJpProcessStepper v-model="activeStep" :items="steps">
        <template #prepare><p>準備内容</p></template>
        <template #connect><p>接続内容</p></template>
      </NuxtJpProcessStepper>
    </main>
  </NuxtJpApp>
</template>
