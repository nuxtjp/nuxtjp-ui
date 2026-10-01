<script setup lang="ts">
import { hierarchyActivation, flattenHierarchy,
  type NuxtJpHierarchyNode, type NuxtJpHierarchyRelation } from '../../core'
import { computed, ref, watch } from 'vue'
interface Point { x: number, y: number }
interface DragState { id: string, pointerId: number, dx: number, dy: number }
const props = defineProps<{ nodes: NuxtJpHierarchyNode[], relations: NuxtJpHierarchyRelation[],
  selectedId: string | null }>()
const emit = defineEmits<{ select: [id: string] }>()
const width = 1200
const rows = computed(() => flattenHierarchy(props.nodes, new Set(), true))
const height = computed(() => Math.max(520, Math.max(1, ...rows.value.map(row => row.depth)) * 150 + 120))
const positions = ref<Record<string, Point>>({})
const drag = ref<DragState | null>(null)
const known = computed(() => new Set(rows.value.map(row => row.node.id)))
const visibleRelations = computed(() => props.relations.filter(relation =>
  known.value.has(relation.sourceId) && known.value.has(relation.targetId)))
const activation = computed(() => hierarchyActivation(visibleRelations.value, props.selectedId))

watch(() => rows.value.map(row => `${row.node.id}:${row.depth}`).join('|'), () => {
  const levels = new Map<number, typeof rows.value>()
  for (const row of rows.value) levels.set(row.depth, [...(levels.get(row.depth) ?? []), row])
  const next: Record<string, Point> = {}
  for (const [depth, values] of levels) values.forEach((row, index) => {
    next[row.node.id] = positions.value[row.node.id]
      ?? { x: (index + 1) * width / (values.length + 1), y: 70 + (depth - 1) * 150 }
  })
  positions.value = next
}, { immediate: true })

function point(id: string): Point { return positions.value[id] ?? { x: 0, y: 0 } }
function coordinate(event: PointerEvent): Point {
  const target = event.currentTarget as SVGElement
  const svg = target instanceof SVGSVGElement ? target : target.ownerSVGElement
  const rect = svg?.getBoundingClientRect()
  return rect ? { x: (event.clientX - rect.left) * width / rect.width,
    y: (event.clientY - rect.top) * height.value / rect.height } : { x: 0, y: 0 }
}
function begin(event: PointerEvent, id: string) {
  const cursor = coordinate(event)
  const current = point(id)
  drag.value = { id, pointerId: event.pointerId, dx: cursor.x - current.x, dy: cursor.y - current.y }
  try { (event.currentTarget as Element).setPointerCapture?.(event.pointerId) } catch { /* synthetic pointer */ }
}
function move(event: PointerEvent) {
  if (!drag.value || drag.value.pointerId !== event.pointerId) return
  const cursor = coordinate(event)
  positions.value = { ...positions.value, [drag.value.id]: {
    x: Math.min(width - 90, Math.max(90, cursor.x - drag.value.dx)),
    y: Math.min(height.value - 45, Math.max(45, cursor.y - drag.value.dy)) } }
}
function end(event: PointerEvent) {
  if (!drag.value || drag.value.pointerId !== event.pointerId) return
  emit('select', drag.value.id)
  drag.value = null
}
function nudge(id: string, dx: number, dy: number) {
  const current = point(id)
  positions.value = { ...positions.value, [id]: { x: Math.min(width - 90, Math.max(90,
    current.x + dx)), y: Math.min(height.value - 45, Math.max(45, current.y + dy)) } }
}
function nodeClass(id: string) {
  if (!props.selectedId) return ''
  if (id === props.selectedId) return 'nuxtjp-graph-node-selected'
  return activation.value.nodeIds.has(id) ? 'nuxtjp-graph-node-active' : 'nuxtjp-graph-node-inactive'
}
</script>

<template>
  <div class="nuxtjp-graph" role="application" aria-label="ノードを動かせる関係グラフ">
    <svg :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="xMidYMid meet"
      role="img" aria-label="階層ノードとリレーション" @pointermove="move" @pointerup="end"
      @pointercancel="end">
      <defs><marker id="nuxtjp-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4"
        orient="auto"><path d="M0,0 L8,4 L0,8 z" /></marker></defs>
      <g v-for="relation in visibleRelations" :key="relation.id" class="nuxtjp-graph-edge"
        :class="{ 'nuxtjp-graph-edge-active': activation.relationIds.has(relation.id),
          'nuxtjp-graph-edge-inactive': selectedId && !activation.relationIds.has(relation.id) }">
        <line :x1="point(relation.sourceId).x" :y1="point(relation.sourceId).y"
          :x2="point(relation.targetId).x" :y2="point(relation.targetId).y"
          marker-end="url(#nuxtjp-arrow)" />
        <text v-if="activation.relationIds.has(relation.id)"
          :x="(point(relation.sourceId).x + point(relation.targetId).x) / 2"
          :y="(point(relation.sourceId).y + point(relation.targetId).y) / 2 - 8"
          text-anchor="middle">{{ relation.label }}</text>
      </g>
      <g v-for="row in rows" :key="row.node.id" class="nuxtjp-graph-node"
        :class="nodeClass(row.node.id)" :transform="`translate(${point(row.node.id).x},
          ${point(row.node.id).y})`" tabindex="0" role="button"
        :aria-label="`${row.node.label}を選択。矢印キーで移動`" @pointerdown.prevent="begin($event, row.node.id)"
        @keydown.enter.prevent="emit('select', row.node.id)"
        @keydown.space.prevent="emit('select', row.node.id)"
        @keydown.left.prevent="nudge(row.node.id, -12, 0)"
        @keydown.right.prevent="nudge(row.node.id, 12, 0)"
        @keydown.up.prevent="nudge(row.node.id, 0, -12)"
        @keydown.down.prevent="nudge(row.node.id, 0, 12)">
        <rect x="-88" y="-34" width="176" height="68" rx="12" />
        <foreignObject x="-78" y="-27" width="156" height="54"><div
          xmlns="http://www.w3.org/1999/xhtml" class="nuxtjp-graph-content">
          <UIcon :name="row.node.iconName" aria-hidden="true" /><span>
            <strong>{{ row.node.label }}</strong><small>{{ row.node.nodeType }}</small></span></div>
        </foreignObject>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.nuxtjp-graph { background:var(--ui-bg-elevated); border:1px solid var(--ui-border);
  border-radius:.75rem; min-height:32rem; overflow:hidden; width:100%; }
.nuxtjp-graph svg { display:block; min-height:32rem; touch-action:none; width:100%; }
.nuxtjp-graph marker path { fill:var(--ui-border-accented); }
.nuxtjp-graph-edge { transition:opacity .15s ease; }
.nuxtjp-graph-edge line { stroke:var(--ui-border-accented); stroke-width:1.5; }
.nuxtjp-graph-edge text { fill:var(--ui-text); font-size:12px; font-weight:700; }
.nuxtjp-graph-edge-active line { stroke:var(--ui-primary); stroke-width:3; }
.nuxtjp-graph-edge-inactive,.nuxtjp-graph-node-inactive { opacity:.16; }
.nuxtjp-graph-node { cursor:grab; outline:none; }
.nuxtjp-graph-node:active { cursor:grabbing; }
.nuxtjp-graph-node rect { fill:var(--ui-bg); stroke:var(--ui-border-accented); stroke-width:2; }
.nuxtjp-graph-content { align-items:center; color:var(--ui-text); display:flex; gap:.5rem;
  height:100%; overflow:hidden; }
.nuxtjp-graph-content > span { display:grid; min-width:0; }
.nuxtjp-graph-content strong { font-size:.72rem; overflow:hidden; text-overflow:ellipsis;
  white-space:nowrap; }
.nuxtjp-graph-content small { color:var(--ui-text-muted); font-size:.6rem; }
.nuxtjp-graph-node-active rect { fill:color-mix(in srgb,var(--ui-bg) 76%,var(--ui-primary) 24%); }
.nuxtjp-graph-node-selected rect { fill:var(--ui-primary); stroke:var(--ui-primary); }
.nuxtjp-graph-node-selected .nuxtjp-graph-content,
.nuxtjp-graph-node-selected small { color:var(--ui-bg); }
.nuxtjp-graph-node:focus-visible rect { stroke:var(--ui-primary); stroke-width:4; }
</style>
