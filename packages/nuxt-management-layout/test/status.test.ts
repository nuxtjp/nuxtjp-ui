import { describe, expect, it } from 'vitest'
import type { ManagementDimensions, ManagementDisplayState } from '../core'
import {
  managementAttentionItems, managementDisplayState, managementStatus, managementTransport
} from '../core'

const base: ManagementDimensions = {
  transport: 'ready', lifecycle: 'configured', health: 'ready', action: 'available'
}

describe('management state dimensions', () => {
  it.each<[Partial<ManagementDimensions>, ManagementDisplayState]>([
    [{ transport: 'error' }, 'error'], [{ transport: 'loading' }, 'loading'],
    [{ health: 'blocked' }, 'blocked'], [{ action: 'busy' }, 'pending'],
    [{ lifecycle: 'unconfigured' }, 'unconfigured'], [{ health: 'degraded' }, 'degraded'],
    [{ health: 'unknown' }, 'unknown'], [{}, 'ready']
  ])('keeps independent state dimensions', (override, expected) => {
    expect(managementDisplayState({ ...base, ...override })).toBe(expected)
  })

  it('keeps read-only action separate from health', () => {
    const status = managementStatus({ ...base, action: 'read-only' }, {
      observedAt: '2026-08-05T04:00:00Z', stale: true
    }, 'en')
    expect(status.state).toBe('ready')
    expect(status.dimensions.action).toBe('read-only')
    expect(status.observedAt).toBe('2026-08-05T04:00:00Z')
    expect(status.stale).toBe(true)
  })

  it('rejects missing successful data and orders attention', () => {
    expect(managementTransport('success', null, null)).toBe('error')
    const item = (id: string, health: ManagementDimensions['health']) => ({
      id, domain: 'test', title: id, description: id,
      status: managementStatus({ ...base, health }), metrics: []
    })
    expect(managementAttentionItems([
      item('ready', 'ready'), item('degraded', 'degraded'), item('blocked', 'blocked')
    ]).map(entry => entry.id)).toEqual(['blocked', 'degraded'])
  })
})
