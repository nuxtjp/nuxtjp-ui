import {
  onBeforeUnmount,
  onMounted,
  readonly,
  ref
} from 'vue'

export const DEFAULT_CLOCK_INTERVAL_MS = 1_000

/**
 * Keeps presentation freshness reactive without starting a timer during SSR.
 */
export function startReactiveClock(
  update: (now: number) => void,
  intervalMs = DEFAULT_CLOCK_INTERVAL_MS
): () => void {
  const timer = globalThis.setInterval(() => update(Date.now()), intervalMs)
  return () => globalThis.clearInterval(timer)
}

export function useReactiveNow(intervalMs = DEFAULT_CLOCK_INTERVAL_MS) {
  const now = ref(Date.now())
  let stop = () => {}
  onMounted(() => {
    stop = startReactiveClock(value => {
      now.value = value
    }, intervalMs)
  })
  onBeforeUnmount(() => stop())
  return readonly(now)
}
