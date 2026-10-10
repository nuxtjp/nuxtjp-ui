import type { ManagedResource } from '../types'
import { isResourceLinkage } from './linkage'
import {
  hasExactKeys,
  isCount,
  isRecord,
  isString,
  isText
} from './primitives'
import { isManagedRepository } from './repository'

function isOwner(value: unknown): boolean {
  return isRecord(value)
    && hasExactKeys(value, ['id', 'name'])
    && isText(value.id)
    && isText(value.name)
}

function isAccountability(value: unknown): boolean {
  return isRecord(value)
    && hasExactKeys(value, [
      'primary_department_id',
      'primary_team_id',
      'label'
    ])
    && isString(value.primary_department_id)
    && isString(value.primary_team_id)
    && isText(value.label)
}

function isReadiness(value: unknown): boolean {
  return isRecord(value)
    && hasExactKeys(value, [
      'status',
      'managed_repository_count',
      'ready_repository_count',
      'linkage_attention_count'
    ])
    && isText(value.status)
    && isCount(value.managed_repository_count)
    && isCount(value.ready_repository_count)
    && isCount(value.linkage_attention_count)
}

export function isManagedResource(value: unknown): value is ManagedResource {
  return isRecord(value)
    && hasExactKeys(value, [
      'id', 'name', 'summary', 'resource_kind', 'category', 'exposure',
      'status', 'owner_organization', 'accountability', 'readiness',
      'repositories', 'incoming_linkages', 'outgoing_linkages'
    ])
    && isText(value.id)
    && isText(value.name)
    && isText(value.summary)
    && isText(value.resource_kind)
    && isText(value.category)
    && isText(value.exposure)
    && isText(value.status)
    && isOwner(value.owner_organization)
    && isAccountability(value.accountability)
    && isReadiness(value.readiness)
    && Array.isArray(value.repositories)
    && value.repositories.every(isManagedRepository)
    && Array.isArray(value.incoming_linkages)
    && value.incoming_linkages.every(isResourceLinkage)
    && Array.isArray(value.outgoing_linkages)
    && value.outgoing_linkages.every(isResourceLinkage)
}
