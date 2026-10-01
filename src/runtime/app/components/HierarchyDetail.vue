<script setup lang="ts">
import type { NuxtJpHierarchyNode, NuxtJpHierarchyRelation } from '../../core'
defineProps<{ selected: NuxtJpHierarchyNode | null, relations: NuxtJpHierarchyRelation[] }>()
</script>

<template>
  <UCard class="nuxtjp-hierarchy-detail">
    <template #header><strong>選択項目の詳細</strong></template>
    <template v-if="selected"><div class="nuxtjp-hierarchy-detail-heading">
      <UIcon :name="selected.iconName" class="nuxtjp-hierarchy-detail-icon" aria-hidden="true" />
      <div><p class="text-sm text-muted">{{ selected.nodeType }}</p>
        <h2 class="text-lg font-semibold">{{ selected.label }}</h2></div></div>
      <p v-if="selected.description" class="mt-2 text-muted">{{ selected.description }}</p>
      <dl class="nuxtjp-hierarchy-meta mt-4"><dt>意味アイコン</dt><dd>{{ selected.semanticIcon }}</dd>
        <dt>決定元</dt><dd>{{ selected.iconSource }}</dd>
        <template v-for="attribute in selected.attributes" :key="attribute.label">
          <dt>{{ attribute.label }}</dt><dd>{{ attribute.value }}</dd></template></dl>
      <h3 class="font-semibold mt-5">直接つながる関係</h3>
      <ul v-if="relations.length" class="mt-2 space-y-2"><li v-for="relation in relations"
        :key="relation.id"><strong>{{ relation.label }}</strong><code class="ml-2 text-xs">
          {{ relation.sourceId === selected.id ? relation.targetId : relation.sourceId }}</code></li></ul>
      <p v-else class="text-sm text-muted mt-2">直接の関係はありません。</p>
    </template>
    <p v-else class="text-muted">項目を選択すると、出所と属性を確認できます。</p>
  </UCard>
</template>

<style scoped>
.nuxtjp-hierarchy-detail-heading { align-items: center; display: flex; gap: .8rem; }
.nuxtjp-hierarchy-detail-icon { color: var(--ui-primary); height: 1.75rem; width: 1.75rem; }
.nuxtjp-hierarchy-meta { display: grid; gap: .45rem 1rem; grid-template-columns: minmax(7rem,auto) 1fr; }
.nuxtjp-hierarchy-meta dt { color: var(--ui-text-muted); }
.nuxtjp-hierarchy-meta dd { font-family: ui-monospace,SFMono-Regular,Menlo,monospace;
  overflow-wrap: anywhere; }
</style>
