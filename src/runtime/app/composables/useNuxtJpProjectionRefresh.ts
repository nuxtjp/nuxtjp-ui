import { onBeforeUnmount, onMounted, readonly, shallowRef } from 'vue'

/** Serial refresh while visible; failures are observable through the returned error ref. */
export function useNuxtJpProjectionRefresh(
  refresh: () => Promise<unknown>,
  intervalMs = 15_000
) {
  const error = shallowRef<unknown>(null)
  const pending = shallowRef(false)
  let active = true
  let timer: ReturnType<typeof setInterval> | undefined

  async function tick() {
    if (!active || pending.value || document.visibilityState !== 'visible') return
    pending.value = true
    if (!active) return
    error.value = null
    if (!active) return
    try {
      await refresh()
    } catch (cause) {
      if (active) error.value = cause
    } finally {
      if (active) pending.value = false
    }
  }

  function stop() {
    active = false
    if (timer !== undefined) clearInterval(timer)
    timer = undefined
    pending.value = false
  }

  onMounted(() => {
    if (active) timer = setInterval(() => { void tick() }, intervalMs)
  })
  onBeforeUnmount(stop)
  return { error: readonly(error), pending: readonly(pending), stop }
}
