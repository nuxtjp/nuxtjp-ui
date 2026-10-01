<script setup lang="ts">
import type { NuxtJpSpatialPoint } from '../../core'
const props = withDefaults(defineProps<{ points: NuxtJpSpatialPoint[], emptyMessage?: string,
  emptyNote?: string }>(), { emptyMessage: '場所情報はありません',
  emptyNote: '別の情報から現在地を推測しません' })
function x(point: NuxtJpSpatialPoint) { return ((point.longitude + 180) / 360) * 720 }
function y(point: NuxtJpSpatialPoint) { return ((90 - point.latitude) / 180) * 340 }
</script>

<template>
  <section class="nuxtjp-spatial-plot" aria-label="確定した位置情報">
    <svg viewBox="0 0 720 340" role="img" aria-label="緯度と経度の位置投影">
      <path class="nuxtjp-spatial-grid"
        d="M0 85H720M0 170H720M0 255H720M180 0V340M360 0V340M540 0V340" />
      <g v-for="point in points" :key="point.id" :transform="`translate(${x(point)} ${y(point)})`">
        <circle r="8" /><title>{{ point.title }}・{{ point.label }}</title>
      </g>
      <text v-if="!points.length" x="360" y="162" text-anchor="middle">{{ emptyMessage }}</text>
      <text v-if="!points.length" x="360" y="187" text-anchor="middle"
        class="nuxtjp-spatial-note">{{ emptyNote }}</text>
    </svg>
    <ul v-if="points.length" class="nuxtjp-spatial-list"><li v-for="point in points" :key="point.id">
      <strong>{{ point.title }}</strong> — {{ point.label }}</li></ul>
  </section>
</template>

<style scoped>
.nuxtjp-spatial-plot { display:grid; gap:.75rem; min-width:0; }
.nuxtjp-spatial-plot svg { background:var(--ui-bg-elevated); border:1px solid var(--ui-border);
  border-radius:.75rem; display:block; width:100%; }
.nuxtjp-spatial-grid { fill:none; stroke:var(--ui-border); stroke-width:1; }
.nuxtjp-spatial-plot circle { fill:var(--ui-primary); stroke:var(--ui-bg); stroke-width:3; }
.nuxtjp-spatial-plot text { fill:var(--ui-text); font-size:15px; }
.nuxtjp-spatial-plot .nuxtjp-spatial-note { fill:var(--ui-text-muted); font-size:12px; }
.nuxtjp-spatial-list { display:grid; gap:.35rem; list-style:disc; padding-inline-start:1.25rem; }
</style>
