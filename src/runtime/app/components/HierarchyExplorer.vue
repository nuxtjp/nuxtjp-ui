<script setup lang="ts">
import { countHierarchy, filterHierarchy, flattenHierarchy, hierarchyActivation,
  hierarchyRelations, type NuxtJpHierarchyFacet, type NuxtJpHierarchyNode,
  type NuxtJpHierarchyRelation } from '../../core'
import { computed, reactive, ref, watch } from 'vue'
const props = withDefaults(defineProps<{ nodes: NuxtJpHierarchyNode[], facets?: NuxtJpHierarchyFacet[],
  relations?: NuxtJpHierarchyRelation[], searchLabel?: string, emptyMessage?: string,
  defaultView?: 'tree' | 'graph' }>(), { facets: () => [], relations: () => [],
  searchLabel: '名前・識別子で絞り込む', emptyMessage: '条件に一致する項目はありません。',
  defaultView: 'tree' })
const query = ref('')
const allValue = '__nuxtjp_all__'
const selections = reactive<Record<string, string>>({})
const expanded = ref<Set<string>>(new Set())
const selectedId = ref<string | null>(null)
const viewMode = ref<'tree' | 'graph'>(props.defaultView)
const viewItems = [{ label: '階層ツリー', value: 'tree', icon: 'i-lucide-list-tree' },
  { label: '関係グラフ', value: 'graph', icon: 'i-lucide-workflow' }]
const filtersActive = computed(() => Boolean(query.value.trim())
  || Object.values(selections).some(value => value && value !== allValue))
const activeSelections = computed(() => Object.fromEntries(Object.entries(selections)
  .filter(([, value]) => value && value !== allValue)))
const filtered = computed(() => filterHierarchy(props.nodes, query.value, activeSelections.value))
const rows = computed(() => flattenHierarchy(filtered.value, expanded.value, filtersActive.value))
const allNodes = computed(() => flattenHierarchy(props.nodes, new Set(), true).map(row => row.node))
const selected = computed(() => allNodes.value.find(node => node.id === selectedId.value) ?? null)
const graphRelations = computed(() => hierarchyRelations(filtered.value, props.relations))
const allRelations = computed(() => hierarchyRelations(props.nodes, props.relations))
const connectedRelations = computed(() => {
  const active = hierarchyActivation(allRelations.value, selectedId.value)
  return allRelations.value.filter(relation => active.relationIds.has(relation.id))
})

watch(() => props.nodes, (nodes) => {
  expanded.value = new Set(nodes.map(node => node.id))
  if (selectedId.value && !allNodes.value.some(node => node.id === selectedId.value)) selectedId.value = null
}, { immediate: true })
watch(filtered, (nodes) => {
  if (selectedId.value && !flattenHierarchy(nodes, new Set(), true)
    .some(row => row.node.id === selectedId.value)) selectedId.value = null
})
function toggle(id: string) {
  const next = new Set(expanded.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expanded.value = next
}
function setSelection(id: string, value: unknown) {
  selections[id] = typeof value === 'string' ? value : allValue
}
</script>

<template>
  <section class="nuxtjp-hierarchy" aria-label="階層と関係の表示">
    <UCard class="nuxtjp-hierarchy-controls">
      <div class="nuxtjp-hierarchy-filters"><UFormField :label="searchLabel">
        <UInput v-model="query" icon="i-lucide-search" autocomplete="off" /></UFormField>
        <UFormField v-for="facet in facets" :key="facet.id" :label="facet.label">
          <USelect :model-value="selections[facet.id] ?? allValue" :items="[
            { label: 'すべて', value: allValue }, ...facet.options]"
            @update:model-value="setSelection(facet.id, $event)" /></UFormField></div>
      <p class="mt-4 text-sm text-muted">{{ countHierarchy(filtered) }}ノードを表示</p>
      <UTabs v-model="viewMode" :items="viewItems" :content="false" variant="link"
        class="nuxtjp-hierarchy-tabs mt-3" aria-label="表示方法" />
    </UCard>
    <NuxtJpHierarchyTree v-if="viewMode === 'tree'" :rows="rows" :expanded="expanded"
      :filters-active="filtersActive" :selected-id="selectedId" :empty-message="emptyMessage"
      @toggle="toggle" @select="selectedId = $event"
      @expand="expanded = new Set(allNodes.map(node => node.id))" @collapse="expanded = new Set()" />
    <UCard v-else class="nuxtjp-hierarchy-graph-card">
      <template #header><div><strong>関係グラフ</strong><p class="text-sm text-muted">
        ノードはドラッグまたは矢印キーで動かせます。選択すると直接の関係を強調します。
      </p></div></template>
      <NuxtJpDraggableGraph v-if="filtered.length" :nodes="filtered" :relations="graphRelations"
        :selected-id="selectedId" @select="selectedId = $event" />
      <p v-else class="text-muted">{{ emptyMessage }}</p>
    </UCard>
    <NuxtJpHierarchyDetail :selected="selected" :relations="connectedRelations" />
  </section>
</template>

<style scoped>
.nuxtjp-hierarchy { display:grid; gap:1rem; min-width:0; }
.nuxtjp-hierarchy-filters { display:grid; gap:1rem;
  grid-template-columns:repeat(auto-fit,minmax(12rem,1fr)); }
.nuxtjp-hierarchy-tabs { width:100%; }
.nuxtjp-hierarchy-graph-card { min-width:0; width:100%; }
</style>
