<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Chart, BarController, BarElement, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { nuxtJpSeriesState, type NuxtJpSeriesKind, type NuxtJpSeriesPoint } from '../core/series'
const props = withDefaults(defineProps<{ label: string; points: NuxtJpSeriesPoint[]; kind?: NuxtJpSeriesKind;
  emptyMessage?: string; invalidMessage?: string }>(), { kind: 'bar', emptyMessage: '表示するデータはありません。', invalidMessage: 'データを表示できません。' })
const canvas = ref<HTMLCanvasElement | null>(null)
const state = computed(() => nuxtJpSeriesState(props.points))
const renderError = ref(false)
let chart: Chart<'bar' | 'line', number[], string> | undefined
function draw() {
  chart?.destroy(); chart = undefined; renderError.value = false
  if (!canvas.value || state.value !== 'ready') return
  const before = Chart.getChart(canvas.value)
  try {
    const context = canvas.value.getContext('2d')
    if (!context) { renderError.value = true; return }
    chart = new Chart(context, { type: props.kind,
      data: { labels: props.points.map(point => point.label), datasets: [{ label: props.label, data: props.points.map(point => point.value), backgroundColor: '#2563eb', borderColor: '#2563eb' }] },
      options: { responsive: true, maintainAspectRatio: false, animation: false, scales: { y: { beginAtZero: true } } },
    })
  } catch {
    const after = Chart.getChart(canvas.value)
    if (after && after !== before) after.destroy()
    renderError.value = true
  }
}
onMounted(() => { Chart.register(BarController, BarElement, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend); draw() })
watch(() => [props.points, props.kind, props.label], draw, { deep: true, flush: 'post' })
onBeforeUnmount(() => chart?.destroy())
</script>
<template>
  <figure class="nuxtjp-series-chart">
    <figcaption>{{ label }}</figcaption>
    <p v-if="state === 'invalid'" role="alert">{{ invalidMessage }}</p>
    <p v-else-if="state === 'empty'">{{ emptyMessage }}</p>
    <p v-if="renderError" role="alert">グラフを表示できません。下の数値を確認してください。</p>
    <div v-show="state === 'ready' && !renderError" class="nuxtjp-series-canvas"><canvas ref="canvas" role="img" :aria-label="label" /></div>
    <ul v-if="state === 'ready'" :aria-label="label + '（数値）'"><li v-for="point in points" :key="point.id">{{ point.label }}: {{ point.value }}</li></ul>
  </figure>
</template>
<style scoped>
.nuxtjp-series-chart { display:grid; gap:.75rem; margin:0; min-width:0; }
.nuxtjp-series-canvas { position:relative; min-height:18rem; }
.nuxtjp-series-chart ul { margin:0; padding-inline-start:1.5rem; }
</style>
