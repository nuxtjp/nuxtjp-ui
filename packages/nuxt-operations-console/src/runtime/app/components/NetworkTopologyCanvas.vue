<script setup lang="ts">
import { computed } from 'vue'
import type {
  NetworkTopologyDocument,
  NetworkTopologyNode,
  OperationsLocale
} from '../../core'

const props = defineProps<{
  document: NetworkTopologyDocument
  locale: OperationsLocale
}>()
const columns = computed(() =>
  Math.max(...props.document.nodes.map(node => node.column), 1))
const rows = computed(() =>
  Math.max(...props.document.nodes.map(node => node.row), 1))
const byId = computed(() =>
  new Map(props.document.nodes.map(node => [node.id, node])))
const point = (node: NetworkTopologyNode) => ({
  x: ((node.column - 0.5) / columns.value) * 100,
  y: ((node.row - 0.5) / rows.value) * 100
})
const edges = computed(() => props.document.edges.map(edge => {
  const source = byId.value.get(edge.source_node_id)!
  const target = byId.value.get(edge.target_node_id)!
  return { ...edge, source: point(source), target: point(target) }
}))
const evidenceLabel = (mode: string) => {
  const labels = props.locale === 'ja'
    ? { 'live-observation': '実観測', declared: '宣言', 'not-connected': '未接続' }
    : { 'live-observation': 'Live', declared: 'Declared', 'not-connected': 'Offline' }
  return labels[mode as keyof typeof labels]
}
</script>

<template>
  <div
    class="njo-topology-canvas"
    :style="{
      '--njo-topology-columns': columns,
      '--njo-topology-rows': rows
    }"
  >
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <line
        v-for="edge in edges"
        :key="edge.id"
        :x1="edge.source.x"
        :y1="edge.source.y"
        :x2="edge.target.x"
        :y2="edge.target.y"
        :class="`is-${edge.status}`"
      />
    </svg>
    <article
      v-for="node in document.nodes"
      :key="node.id"
      class="njo-topology-node"
      :class="[`is-${node.status}`, `evidence-${node.evidence_mode}`]"
      :style="{ gridColumn: node.column, gridRow: node.row }"
    >
      <div class="njo-topology-node-head">
        <span>{{ node.kind }}</span><b>{{ node.status }}</b>
      </div>
      <strong>{{ node.label }}</strong>
      <small>{{ node.zone }} · {{ evidenceLabel(node.evidence_mode) }}</small>
      <small v-if="node.isolation_mode">{{ node.isolation_mode }}</small>
      <p v-if="node.finding_codes.length">{{ node.finding_codes.join(' · ') }}</p>
    </article>
  </div>
</template>
