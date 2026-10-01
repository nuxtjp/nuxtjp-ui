<script setup lang="ts">
import type { NuxtJpHierarchyNode } from '../../core'
const props = defineProps<{ rows: Array<{ node: NuxtJpHierarchyNode, depth: number, branch: boolean }>,
  expanded: Set<string>, filtersActive: boolean, selectedId: string | null, emptyMessage: string }>()
const emit = defineEmits<{ toggle: [id: string], select: [id: string], expand: [], collapse: [] }>()
</script>

<template>
  <UCard class="nuxtjp-hierarchy-tree">
    <template #header><div class="nuxtjp-hierarchy-tree-header"><strong>階層ツリー</strong>
      <div class="nuxtjp-hierarchy-actions"><UButton size="sm" variant="outline"
        @click="emit('expand')">すべて展開</UButton><UButton size="sm" variant="outline"
        @click="emit('collapse')">すべて閉じる</UButton></div></div></template>
    <div v-if="rows.length" role="tree" aria-label="階層項目">
      <div v-for="row in rows" :key="row.node.id" class="nuxtjp-hierarchy-row" role="treeitem"
        :aria-level="row.depth" :aria-expanded="row.branch
          ? (filtersActive || expanded.has(row.node.id)) : undefined"
        :data-selected="selectedId === row.node.id"
        :style="{ '--nuxtjp-tree-depth': String(row.depth - 1) }">
        <UButton v-if="row.branch" size="xs" color="neutral" variant="ghost"
          :icon="filtersActive || expanded.has(row.node.id) ? 'i-lucide-minus' : 'i-lucide-plus'"
          :disabled="filtersActive" :aria-label="`${row.node.label}を開閉`"
          @click="emit('toggle', row.node.id)" />
        <span v-else class="nuxtjp-hierarchy-spacer" aria-hidden="true" />
        <UButton class="nuxtjp-hierarchy-label" color="neutral" variant="ghost"
          :icon="row.node.iconName" :label="row.node.label" @click="emit('select', row.node.id)" />
        <span class="nuxtjp-hierarchy-kind">{{ row.node.nodeType }}</span>
        <div class="nuxtjp-hierarchy-actions"><UBadge v-for="badge in row.node.badges" :key="badge"
          color="neutral" variant="subtle">{{ badge }}</UBadge></div>
      </div>
    </div>
    <p v-else class="text-muted">{{ emptyMessage }}</p>
  </UCard>
</template>

<style scoped>
.nuxtjp-hierarchy-tree-header,.nuxtjp-hierarchy-actions { align-items: center; display: flex;
  flex-wrap: wrap; gap: .5rem; justify-content: space-between; }
.nuxtjp-hierarchy-row { align-items: center; border-bottom: 1px solid var(--ui-border);
  display: grid; gap: .5rem; grid-template-columns: 2rem minmax(10rem, 1fr) auto auto;
  min-height: 3.25rem; padding: .35rem .5rem .35rem calc(.5rem + var(--nuxtjp-tree-depth) * 1.2rem); }
.nuxtjp-hierarchy-row:last-child { border-bottom: 0; }
.nuxtjp-hierarchy-row[data-selected='true'] { background: color-mix(in srgb,var(--ui-bg) 80%,
  var(--ui-primary) 20%); }
.nuxtjp-hierarchy-label { justify-content: flex-start; min-width: 0; }
.nuxtjp-hierarchy-kind { color: var(--ui-text-muted); font-size: .78rem; }
.nuxtjp-hierarchy-spacer { width: 2rem; }
@media (max-width: 48rem) { .nuxtjp-hierarchy-row { grid-template-columns: 2rem minmax(0,1fr); }
  .nuxtjp-hierarchy-kind,.nuxtjp-hierarchy-row > .nuxtjp-hierarchy-actions { grid-column: 2; } }
</style>
