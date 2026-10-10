<script setup lang="ts">
import { computed } from 'vue'
import StatusBadge from './StatusBadge.vue'
import type { ManagedResource } from '../../shared/types'

const props = defineProps<{
  resource: ManagedResource
  detailBasePath?: string
}>()

const href = computed(() => {
  const base = props.detailBasePath?.trim()
  if (!base || !/^\/(?!\/)[a-zA-Z0-9/_-]*$/.test(base)) {
    return undefined
  }
  return `${base.replace(/\/$/, '')}/${encodeURIComponent(props.resource.id)}`
})
</script>

<template>
  <article class="nj-resource-card">
    <header class="nj-resource-card__header">
      <div>
        <p class="nj-resource-card__category">{{ resource.category }}</p>
        <h2>
          <a v-if="href" :href="href">{{ resource.name }}</a>
          <span v-else>{{ resource.name }}</span>
        </h2>
      </div>
      <StatusBadge :status="resource.readiness.status" />
    </header>

    <p class="nj-resource-card__summary">{{ resource.summary }}</p>

    <dl class="nj-resource-card__facts">
      <div>
        <dt>所有組織</dt>
        <dd>{{ resource.owner_organization.name }}</dd>
      </div>
      <div>
        <dt>管理Repository</dt>
        <dd>
          {{ resource.readiness.ready_repository_count }} /
          {{ resource.readiness.managed_repository_count }} ready
        </dd>
      </div>
      <div>
        <dt>連携</dt>
        <dd>{{ resource.incoming_linkages.length + resource.outgoing_linkages.length }} links</dd>
      </div>
    </dl>

    <div class="nj-resource-card__accountability">
      <span>Accountability</span>
      <strong>{{ resource.accountability.label }}</strong>
      <small>
        {{ resource.accountability.primary_department_id }}
        · {{ resource.accountability.primary_team_id }}
      </small>
    </div>

    <ul class="nj-repository-list" aria-label="管理リポジトリ">
      <li v-for="repository in resource.repositories" :key="repository.id">
        <span>
          <strong>{{ repository.name }}</strong>
          <small>
            {{ repository.kind }} · custody {{ repository.organization_id }}
            · {{ repository.placement_scope }}
          </small>
          <small>
            source {{ repository.source_organization_id || 'not separately registered' }}
          </small>
        </span>
        <StatusBadge :status="repository.readiness.status" />
      </li>
    </ul>
  </article>
</template>
