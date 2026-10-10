import type { ResourceLinkage } from '../types'
import { hasExactKeys, isRecord, isText } from './primitives'

export function isResourceLinkage(value: unknown): value is ResourceLinkage {
  return isRecord(value)
    && hasExactKeys(value, [
      'id', 'name', 'other_resource_id', 'other_resource_name',
      'relationship', 'interface_kind', 'operation_mode',
      'configuration_status', 'contract_status', 'machine_status',
      'human_review_status', 'overall_status', 'external_actions'
    ])
    && isText(value.id)
    && isText(value.name)
    && isText(value.other_resource_id)
    && isText(value.other_resource_name)
    && isText(value.relationship)
    && isText(value.interface_kind)
    && isText(value.operation_mode)
    && isText(value.configuration_status)
    && isText(value.contract_status)
    && isText(value.machine_status)
    && isText(value.human_review_status)
    && isText(value.overall_status)
    && value.external_actions === false
}
