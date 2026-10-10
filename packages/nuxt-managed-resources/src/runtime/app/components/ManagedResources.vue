<script setup lang="ts">
// This component renders and filters caller-owned descriptors; it deliberately
// has no discovery, filesystem, provider, or authorization responsibility.
import { computed } from 'vue'
import ManagedResourceCard from './ManagedResourceCard.vue'
import { useManagedResources } from '../composables/useManagedResources'
import type { ManagedResource } from '../../shared/types'

const props = withDefaults(defineProps<{
  resources: ManagedResource[]
  detailBasePath?: string
  heading?: string
}>(), {
  detailBasePath: '',
  heading: '管理対象リソース'
})

const source = computed(() => props.resources)
const {
  query,
  organizationId,
  readiness,
  organizations,
  filteredResources,
  summary,
  resetFilters
} = useManagedResources(source)
</script>

<template>
  <section class="nj-managed-resources" aria-labelledby="nj-managed-resources-title">
    <div class="nj-managed-resources__heading">
      <div>
        <p class="nj-kicker">DECLARATIVE MANAGED RESOURCES</p>
        <h1 id="nj-managed-resources-title">{{ heading }}</h1>
        <p>呼び出し元が提供した所有・Repository・連携情報を表示します。</p>
      </div>
      <slot name="heading-trailing" />
    </div>

    <dl class="nj-summary-grid" aria-label="管理対象リソース集計">
      <div>
        <dt>リソース</dt>
        <dd>{{ summary.resourceCount }}</dd>
        <small>{{ summary.readyResourceCount }} ready</small>
      </div>
      <div>
        <dt>Repository</dt>
        <dd>{{ summary.repositoryCount }}</dd>
        <small>{{ summary.readyRepositoryCount }} ready</small>
      </div>
      <div>
        <dt>連携経路</dt>
        <dd>{{ summary.linkageCount }}</dd>
        <small>{{ summary.attentionCount }} attention</small>
      </div>
    </dl>

    <form class="nj-resource-filters" role="search" @submit.prevent>
      <label>
        <span>検索</span>
        <input
          v-model="query"
          type="search"
          placeholder="リソース、Repository、組織を検索"
        >
      </label>
      <label>
        <span>所有組織</span>
        <select v-model="organizationId">
          <option value="">すべて</option>
          <option
            v-for="organization in organizations"
            :key="organization.id"
            :value="organization.id"
          >
            {{ organization.name }}
          </option>
        </select>
      </label>
      <label>
        <span>状態</span>
        <select v-model="readiness">
          <option value="">すべて</option>
          <option value="ready">ready</option>
          <option value="attention">attention</option>
        </select>
      </label>
      <button type="button" @click="resetFilters">条件をクリア</button>
    </form>

    <p class="nj-result-count" aria-live="polite">
      {{ filteredResources.length }} / {{ resources.length }} 件を表示
    </p>

    <div v-if="filteredResources.length" class="nj-resource-grid">
      <ManagedResourceCard
        v-for="resource in filteredResources"
        :key="resource.id"
        :resource="resource"
        :detail-base-path="detailBasePath"
      />
    </div>
    <div v-else class="nj-empty-state">
      <strong>条件に一致するリソースはありません</strong>
      <p>検索条件を変更するか、呼び出し元のデータを確認してください。</p>
      <button type="button" @click="resetFilters">すべて表示</button>
    </div>
  </section>
</template>
