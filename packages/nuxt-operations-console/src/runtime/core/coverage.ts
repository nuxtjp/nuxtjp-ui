import { isFreshProjection } from './freshness'
import type {
  ControlCoverageAsset,
  ControlCoverageDocument,
  ControlCoveragePresentation,
  ControlCoverageState
} from './types'

export function summarizeControlCoverage(
  document: ControlCoverageDocument,
  now: number | Date = Date.now()
): ControlCoveragePresentation {
  const stale = !isFreshProjection(document.generated_at_epoch_s, now)
  const controlledCount = stale ? 0 : document.summary.controlled_count
  return {
    state: stale ? 'unknown' : document.overall_state,
    assetCount: document.summary.asset_count,
    controlledCount,
    gapCount: document.summary.asset_count - controlledCount,
    stale
  }
}

export function controlCoverageAssetState(
  asset: ControlCoverageAsset,
  generatedAt: number,
  now: number | Date = Date.now()
): ControlCoverageState {
  return isFreshProjection(generatedAt, now) ? asset.state : 'unknown'
}

export function controlCoverageIsolationReady(
  asset: ControlCoverageAsset,
  generatedAt: number,
  now: number | Date = Date.now()
): boolean {
  return isFreshProjection(generatedAt, now)
    && asset.state === 'controlled'
    && asset.isolation_ready
    && asset.finding_codes.length === 0
}

export function controlCoverageFindings(
  asset: ControlCoverageAsset,
  generatedAt: number,
  now: number | Date = Date.now()
): string[] {
  return isFreshProjection(generatedAt, now)
    ? [...asset.finding_codes]
    : [...new Set([...asset.finding_codes, 'coverage-snapshot-stale'])]
}
