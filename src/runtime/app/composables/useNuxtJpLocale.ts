import type { NuxtJpUiLocale } from '../../core'
import { useAppConfig } from '#imports'
import { computed } from 'vue'

export function useNuxtJpLocale() {
  const appConfig = useAppConfig()
  return computed<NuxtJpUiLocale>(() => {
    const value = appConfig.nuxtJpUi as { locale?: unknown } | undefined
    return value?.locale === 'en' ? 'en' : 'ja'
  })
}
