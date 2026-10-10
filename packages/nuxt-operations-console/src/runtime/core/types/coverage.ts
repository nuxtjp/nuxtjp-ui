import type { OperationsLocale } from './common'

export const CONTROL_COVERAGE_SCHEMA =
  'crowsi://network/control-coverage-snapshot/v2' as const

export type ControlCoverageState =
  | 'controlled'
  | 'partial'
  | 'unknown'
  | 'unmanaged'

export interface ControlCoverageAsset {
  id: string
  state: ControlCoverageState
  isolation_ready: boolean
  finding_codes: string[]
}

export interface ControlCoverageSummary {
  asset_count: number
  controlled_count: number
  gap_count: number
}

export interface ControlCoverageDocument {
  schema: typeof CONTROL_COVERAGE_SCHEMA
  generated_at_epoch_s: number
  external_actions: false
  overall_state: ControlCoverageState
  summary: ControlCoverageSummary
  assets: ControlCoverageAsset[]
}

export interface ControlCoveragePresentation {
  state: ControlCoverageState
  assetCount: number
  controlledCount: number
  gapCount: number
  stale: boolean
}

export interface ControlCoverageLabels {
  heading: string
  description: string
  invalid: string
  stale: string
  assets: string
  controlled: string
  gaps: string
  generatedAt: string
  status: string
  asset: string
  isolation: string
  findings: string
  verified: string
  notVerified: string
  none: string
}

export type ControlCoverageLabelResolver = (
  locale: OperationsLocale,
  overrides?: Partial<ControlCoverageLabels>
) => ControlCoverageLabels
