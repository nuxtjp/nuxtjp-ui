import {
  computed,
  toValue,
  type MaybeRefOrGetter
} from 'vue'
import {
  resolveLabels,
  summarizeOperations,
  validateOperationsDocuments
} from '../../core'
import type {
  OperationsConsoleLabels,
  OperationsDocuments,
  OperationsLocale
} from '../../core'
import { useReactiveNow } from './useReactiveNow'

export function useOperationsConsole(
  source: MaybeRefOrGetter<OperationsDocuments>,
  locale: MaybeRefOrGetter<OperationsLocale> = 'ja',
  labelOverrides: MaybeRefOrGetter<Partial<OperationsConsoleLabels>> = {}
) {
  const now = useReactiveNow()
  const validation = computed(() => validateOperationsDocuments(toValue(source)))
  const documents = computed(() => {
    const result = validation.value
    return result.valid ? result.documents : undefined
  })
  const summary = computed(() => {
    const value = documents.value
    return value ? summarizeOperations(value, now.value) : undefined
  })
  const labels = computed(() =>
    resolveLabels(toValue(locale), toValue(labelOverrides))
  )
  const invalidDocuments = computed(() => {
    const checks = validation.value.checks
    return [
      !checks.credentialReadiness && labels.value.credentials,
      !checks.networkObservations && labels.value.networks,
      !checks.networkControls && labels.value.controls
    ].filter((value): value is string => typeof value === 'string')
  })
  return {
    now,
    validation,
    documents,
    summary,
    labels,
    invalidDocuments
  }
}
