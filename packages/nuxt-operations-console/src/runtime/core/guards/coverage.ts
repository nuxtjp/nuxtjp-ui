import {
  CONTROL_COVERAGE_SCHEMA,
  type ControlCoverageAsset,
  type ControlCoverageDocument,
  type ControlCoverageState
} from '../types'
import {
  hasExactKeys,
  hasUniqueIds,
  isBoundedArray,
  isCount,
  isIdentifier,
  isRecord,
  isUniqueIdentifierArray,
  isUnixSeconds
} from './primitives'

const states: ControlCoverageState[] = [
  'controlled', 'partial', 'unknown', 'unmanaged'
]
const documentKeys = [
  'schema', 'generated_at_epoch_s', 'external_actions',
  'overall_state', 'summary', 'assets'
]
const summaryKeys = ['asset_count', 'controlled_count', 'gap_count']
const assetKeys = ['id', 'state', 'isolation_ready', 'finding_codes']

function isState(value: unknown): value is ControlCoverageState {
  return typeof value === 'string'
    && states.includes(value as ControlCoverageState)
}

function isCoverageAsset(value: unknown): value is ControlCoverageAsset {
  if (!isRecord(value) || !hasExactKeys(value, assetKeys)) return false
  if (!isIdentifier(value.id)
    || !isState(value.state)
    || typeof value.isolation_ready !== 'boolean'
    || !isUniqueIdentifierArray(value.finding_codes)) return false
  const controlled = value.state === 'controlled'
  return value.isolation_ready === controlled
    && (controlled ? value.finding_codes.length === 0 : value.finding_codes.length > 0)
}

export function isControlCoverageDocument(
  value: unknown
): value is ControlCoverageDocument {
  if (!isRecord(value) || !hasExactKeys(value, documentKeys)) return false
  if (value.schema !== CONTROL_COVERAGE_SCHEMA
    || value.external_actions !== false
    || !isUnixSeconds(value.generated_at_epoch_s)
    || value.generated_at_epoch_s < 1
    || !isState(value.overall_state)
    || !isRecord(value.summary)
    || !hasExactKeys(value.summary, summaryKeys)
    || !isBoundedArray(value.assets)
    || value.assets.length < 1
    || !value.assets.every(isCoverageAsset)) return false
  const assets = value.assets
  if (!hasUniqueIds(assets)) return false
  const controlled = assets.filter(asset => asset.state === 'controlled').length
  return isCount(value.summary.asset_count)
    && isCount(value.summary.controlled_count)
    && isCount(value.summary.gap_count)
    && value.summary.asset_count === assets.length
    && value.summary.controlled_count === controlled
    && value.summary.gap_count === assets.length - controlled
    && value.overall_state === reduceCoverageState(assets)
}

function reduceCoverageState(assets: ControlCoverageAsset[]): ControlCoverageState {
  if (assets.every(asset => asset.state === 'controlled')) return 'controlled'
  if (assets.some(asset => asset.state === 'unmanaged')) return 'unmanaged'
  if (assets.some(asset => asset.state === 'unknown')) return 'unknown'
  return 'partial'
}
