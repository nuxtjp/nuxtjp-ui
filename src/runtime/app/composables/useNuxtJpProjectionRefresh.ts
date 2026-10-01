import { onBeforeUnmount, onMounted } from 'vue'

/** Refreshes volatile projections only while the browser page remains visible. */
export function useNuxtJpProjectionRefresh(
  refresh: () => Promise<unknown>,
  intervalMs = 15_000
) {
  let timer: ReturnType<typeof setInterval> | undefined
  onMounted(() => {
    timer = setInterval(() => {
      if (document.visibilityState === 'visible') void refresh()
    }, intervalMs)
  })
  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
  })
}
