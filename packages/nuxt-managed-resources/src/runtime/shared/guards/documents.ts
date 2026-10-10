import type {
  ManagedResourcesDocument,
  ManagedResourceDetailDocument
} from '../types'
import {
  hasExactKeys,
  isBoolean,
  isCount,
  isRecord,
  isText
} from './primitives'
import { isManagedResource } from './resource'

export function isManagedResourcesDocument(
  value: unknown
): value is ManagedResourcesDocument {
  return isRecord(value)
    && hasExactKeys(value, [
      'schema', 'mode', 'observed_at_unix_seconds', 'external_actions',
      'healthy', 'resource_count', 'resources'
    ])
    && value.schema === 'nuxtjp://managed-resources/list/v1'
    && isText(value.mode)
    && isCount(value.observed_at_unix_seconds)
    && value.external_actions === false
    && isBoolean(value.healthy)
    && isCount(value.resource_count)
    && Array.isArray(value.resources)
    && value.resources.every(isManagedResource)
    && value.resource_count === value.resources.length
}

export function isManagedResourceDetailDocument(
  value: unknown
): value is ManagedResourceDetailDocument {
  return isRecord(value)
    && hasExactKeys(value, [
      'schema', 'mode', 'observed_at_unix_seconds', 'external_actions', 'resource'
    ])
    && value.schema === 'nuxtjp://managed-resources/detail/v1'
    && isText(value.mode)
    && isCount(value.observed_at_unix_seconds)
    && value.external_actions === false
    && isManagedResource(value.resource)
}
