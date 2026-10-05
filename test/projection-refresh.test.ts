import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const lifecycle = vi.hoisted(() => ({ mounted: [] as (() => void)[], disposed: [] as (() => void)[] }))
vi.mock('vue', async (original) => ({
  ...await original<typeof import('vue')>(),
  onMounted: (fn: () => void) => lifecycle.mounted.push(fn),
  onBeforeUnmount: (fn: () => void) => lifecycle.disposed.push(fn)
}))
import { useNuxtJpProjectionRefresh } from '../src/runtime/app/composables/useNuxtJpProjectionRefresh'

function mount(refresh: () => Promise<unknown>) {
  const state = useNuxtJpProjectionRefresh(refresh, 100)
  lifecycle.mounted.forEach(fn => fn())
  return state
}
function deferred() {
  let resolve!: (value?: unknown) => void
  let reject!: (cause: unknown) => void
  const promise = new Promise<unknown>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
beforeEach(() => {
  lifecycle.mounted.length = 0
  lifecycle.disposed.length = 0
  vi.useFakeTimers()
  vi.stubGlobal('document', { visibilityState: 'visible' })
})
afterEach(() => {
  lifecycle.disposed.forEach(fn => fn())
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('projection refresh scheduling', () => {
  it('reports rejection and permits recovery on the next tick', async () => {
    const failure = new Error('synthetic refresh failure')
    const refresh = vi.fn().mockRejectedValueOnce(failure).mockResolvedValue(undefined)
    const state = mount(refresh)
    await vi.advanceTimersByTimeAsync(100)
    expect(state.error.value).toBe(failure)
    expect(state.pending.value).toBe(false)
    await vi.advanceTimersByTimeAsync(100)
    expect(refresh).toHaveBeenCalledTimes(2)
    expect(state.error.value).toBeNull()
  })
  it('catches synchronous callback failures', async () => {
    const failure = new Error('synthetic synchronous failure')
    const state = mount(() => { throw failure })
    await vi.advanceTimersByTimeAsync(100)
    expect(state.error.value).toBe(failure)
    expect(state.pending.value).toBe(false)
  })
  it('skips delayed ticks instead of overlapping or accumulating work', async () => {
    const first = deferred()
    const refresh = vi.fn().mockReturnValueOnce(first.promise).mockResolvedValue(undefined)
    const state = mount(refresh)
    await vi.advanceTimersByTimeAsync(500)
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(state.pending.value).toBe(true)
    first.resolve()
    await vi.advanceTimersByTimeAsync(0)
    expect(state.pending.value).toBe(false)
    await vi.advanceTimersByTimeAsync(100)
    expect(refresh).toHaveBeenCalledTimes(2)
  })
  it('prevents synchronous timer re-entry while the callback is running', async () => {
    const refresh = vi.fn(() => { vi.advanceTimersByTime(100); return Promise.resolve() })
    mount(refresh)
    await vi.advanceTimersByTimeAsync(100)
    expect(refresh).toHaveBeenCalledTimes(1)
  })
  it('skips hidden pages and resumes when visible', async () => {
    const refresh = vi.fn().mockResolvedValue(undefined)
    mount(refresh)
    vi.stubGlobal('document', { visibilityState: 'hidden' })
    await vi.advanceTimersByTimeAsync(300)
    expect(refresh).not.toHaveBeenCalled()
    vi.stubGlobal('document', { visibilityState: 'visible' })
    await vi.advanceTimersByTimeAsync(100)
    expect(refresh).toHaveBeenCalledTimes(1)
  })
  it.each(['resolve', 'reject'] as const)('disposal ignores late %s and clears scheduling', async (kind) => {
    const work = deferred()
    const refresh = vi.fn(() => work.promise)
    const state = mount(refresh)
    await vi.advanceTimersByTimeAsync(100)
    lifecycle.disposed.forEach(fn => fn())
    if (kind === 'reject') work.reject(new Error('synthetic late failure'))
    else work.resolve()
    await vi.advanceTimersByTimeAsync(500)
    expect(state.pending.value).toBe(false)
    expect(state.error.value).toBeNull()
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(vi.getTimerCount()).toBe(0)
  })
  it('stop before mount is idempotent and schedules no work', async () => {
    const refresh = vi.fn().mockResolvedValue(undefined)
    const state = useNuxtJpProjectionRefresh(refresh, 100)
    state.stop()
    state.stop()
    lifecycle.mounted.forEach(fn => fn())
    await vi.advanceTimersByTimeAsync(300)
    expect(refresh).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })
})
