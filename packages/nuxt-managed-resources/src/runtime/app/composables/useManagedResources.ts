import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue'
import {
  filterResources,
  summarizeResources
} from '../../shared/resources'
import type { ManagedResource } from '../../shared/types'

export function useManagedResources(resources: MaybeRefOrGetter<readonly ManagedResource[]>) {
  const query = ref('')
  const organizationId = ref('')
  const readiness = ref('')

  const organizations = computed(() => {
    const values = new Map<string, string>()
    for (const resource of toValue(resources)) {
      values.set(resource.owner_organization.id, resource.owner_organization.name)
    }
    return [...values.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((left, right) => left.name.localeCompare(right.name, 'ja'))
  })
  const filteredResources = computed(() => filterResources(toValue(resources), {
    query: query.value,
    organizationId: organizationId.value,
    readiness: readiness.value
  }))
  const summary = computed(() => summarizeResources(toValue(resources)))

  function resetFilters() {
    query.value = ''
    organizationId.value = ''
    readiness.value = ''
  }

  return {
    query,
    organizationId,
    readiness,
    organizations,
    filteredResources,
    summary,
    resetFilters
  }
}
