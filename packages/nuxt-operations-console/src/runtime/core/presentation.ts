import { isFreshProjection, isFuture } from './freshness'
import type {
  CredentialReadiness,
  NetworkControlDecision,
  NetworkObservation,
  OperationsLocale
} from './types'

export type StatusTone = 'positive' | 'warning' | 'negative' | 'neutral'

export function statusTone(status: string): StatusTone {
  if (['ready', 'reachable', 'observed', 'recorded', 'controlled'].includes(status)) {
    return 'positive'
  }
  if (['degraded', 'allowed-dry-run', 'partial'].includes(status)) return 'warning'
  if ([
    'expired', 'revoked', 'unavailable', 'denied', 'unknown', 'unmanaged'
  ].includes(status)) {
    return 'negative'
  }
  return 'neutral'
}

export function formatTimestamp(
  value: string | number | null,
  locale: OperationsLocale
): string {
  if (value === null) return '—'
  const instant = typeof value === 'number' ? new Date(value * 1000) : new Date(value)
  return new Intl.DateTimeFormat(locale === 'ja' ? 'ja-JP' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(instant)
}

export function formatLatency(value: number | null): string {
  return value === null ? '—' : `${value.toFixed(value < 10 ? 1 : 0)} ms`
}

export function credentialDisplayStatus(
  item: CredentialReadiness,
  now: number | Date = Date.now()
): string {
  if (item.status !== 'ready') return item.status
  if (!isFuture(item.expires_at, now)) return 'expired'
  return isFreshProjection(item.checked_at, now) ? item.status : 'unavailable'
}

export function observationDisplayStatus(
  item: NetworkObservation,
  now: number | Date = Date.now()
): string {
  if (!['reachable', 'observed'].includes(item.status)) return item.status
  return isFreshProjection(item.observed_at, now) ? item.status : 'unavailable'
}

export function decisionDisplayStatus(
  item: NetworkControlDecision,
  now: number | Date = Date.now()
): string {
  if (item.status !== 'allowed-dry-run') return item.status
  return isFuture(item.expires_at, now) ? item.status : 'expired'
}
