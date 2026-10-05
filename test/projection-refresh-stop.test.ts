import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { watch, version } from 'vue'

const lifecycle = vi.hoisted(() => ({ mounted: [] as (() => void)[], disposed: [] as (() => void)[] }))
vi.mock('vue', async (original) => ({
  ...await original<typeof import('vue')>(),
  onMounted: (fn: () => void) => lifecycle.mounted.push(fn),
  onBeforeUnmount: (fn: () => void) => lifecycle.disposed.push(fn)
}))
import { useNuxtJpProjectionRefresh } from '../src/runtime/app/composables/useNuxtJpProjectionRefresh'

const watchers: (() => void)[] = []
beforeEach(() => {
  lifecycle.mounted.length = 0
  lifecycle.disposed.length = 0
  vi.useFakeTimers()
  vi.stubGlobal('document', { visibilityState: 'visible' })
})
afterEach(() => {
  watchers.splice(0).forEach(stop => stop())
  lifecycle.disposed.forEach(fn => fn())
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('real Vue synchronous observer cleanup', () => {
  it.each(['stop', 'unmount'] as const)('checks active after pending observer %s', async (kind) => {
    expect(version).toBe('3.5.43')
    const failure = new Error('synthetic earlier failure')
    const refresh = vi.fn().mockRejectedValueOnce(failure).mockResolvedValue(undefined)
    const state = useNuxtJpProjectionRefresh(refresh, 100)
    lifecycle.mounted.forEach(fn => fn())
    await vi.advanceTimersByTimeAsync(100)
    expect(state.error.value).toBe(failure)
    watchers.push(watch(state.pending, value => {
      if (!value) return
      if (kind === 'stop') state.stop()
      else lifecycle.disposed.forEach(fn => fn())
    }, { flush: 'sync' }))
    await vi.advanceTimersByTimeAsync(500)
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(state.pending.value).toBe(false)
    expect(state.error.value).toBe(failure)
    expect(vi.getTimerCount()).toBe(0)
  })

  it.each(['stop', 'unmount'] as const)('checks active after error observer %s', async (kind) => {
    const failure = new Error('synthetic earlier failure')
    const refresh = vi.fn().mockRejectedValueOnce(failure).mockResolvedValue(undefined)
    const state = useNuxtJpProjectionRefresh(refresh, 100)
    lifecycle.mounted.forEach(fn => fn())
    await vi.advanceTimersByTimeAsync(100)
    watchers.push(watch(state.error, value => {
      if (value !== null) return
      if (kind === 'stop') state.stop()
      else lifecycle.disposed.forEach(fn => fn())
    }, { flush: 'sync' }))
    await vi.advanceTimersByTimeAsync(500)
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(state.pending.value).toBe(false)
    expect(state.error.value).toBeNull()
    expect(vi.getTimerCount()).toBe(0)
  })
})
