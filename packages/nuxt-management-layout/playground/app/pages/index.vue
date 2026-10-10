<script setup lang="ts">
import { managementStatus } from '../../../core'

const item = {
  id: 'example', domain: '運用', title: '公開契約の状態',
  description: '業務データをLayerへ渡さず、表示規則だけを確認します。',
  status: managementStatus({
    transport: 'ready', lifecycle: 'configured', health: 'degraded', action: 'read-only'
  }, { observedAt: '2026-08-05T04:00:00Z', stale: true }),
  sourceLabel: 'Playground fixture',
  metrics: [{ label: '確認項目', value: 4 }, { label: '要確認', value: 1 }]
}
</script>

<template>
  <NuxtJpPageHeader eyebrow="PLAYGROUND" title="運用概要"
    description="管理レイアウトを独立して検証します。" />
  <NuxtJpManagementStatusSummary :item="item" />
</template>
