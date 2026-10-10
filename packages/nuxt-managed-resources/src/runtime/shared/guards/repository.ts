import type { ManagedRepository } from '../types'
import {
  hasExactKeys,
  isBoolean,
  isCount,
  isRecord,
  isString,
  isText,
  isTextArray
} from './primitives'

function isCheck(value: unknown): boolean {
  return isRecord(value)
    && hasExactKeys(value, ['name', 'status'])
    && isText(value.name)
    && isText(value.status)
}

function isReadiness(value: unknown): boolean {
  return isRecord(value)
    && hasExactKeys(value, [
      'status', 'exists', 'identity_valid', 'git_initialized',
      'manifest_valid', 'package_count', 'finding_codes'
    ])
    && isText(value.status)
    && isBoolean(value.exists)
    && isBoolean(value.identity_valid)
    && isBoolean(value.git_initialized)
    && isBoolean(value.manifest_valid)
    && isCount(value.package_count)
    && isTextArray(value.finding_codes)
}

function isObservation(value: unknown): boolean {
  if (value === null) return true
  return isRecord(value)
    && hasExactKeys(value, [
      'mode', 'observed_at_unix_seconds', 'dirty_entry_count',
      'ready', 'content_read', 'external_actions'
    ])
    && isText(value.mode)
    && isCount(value.observed_at_unix_seconds)
    && (value.dirty_entry_count === null || isCount(value.dirty_entry_count))
    && isBoolean(value.ready)
    && value.content_read === false
    && value.external_actions === false
}

export function isManagedRepository(value: unknown): value is ManagedRepository {
  return isRecord(value)
    && hasExactKeys(value, [
      'id', 'name', 'organization_id', 'source_organization_id',
      'placement_scope', 'lifecycle', 'kind', 'visibility', 'package_name',
      'checks', 'readiness', 'observation'
    ])
    && isText(value.id)
    && isText(value.name)
    && isText(value.organization_id)
    && (value.source_organization_id === null || isText(value.source_organization_id))
    && isText(value.placement_scope)
    && isText(value.lifecycle)
    && isText(value.kind)
    && isText(value.visibility)
    && isString(value.package_name)
    && Array.isArray(value.checks)
    && value.checks.every(isCheck)
    && isReadiness(value.readiness)
    && isObservation(value.observation)
}
