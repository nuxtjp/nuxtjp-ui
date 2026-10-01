export type NuxtJpUiColor =
  | 'primary' | 'secondary' | 'success' | 'info'
  | 'warning' | 'error' | 'neutral'

export type NuxtJpUiLocale = 'ja' | 'en'
export type NuxtJpUiTransport = 'loading' | 'ready' | 'error'
export type NuxtJpUiReadState = 'pending' | 'ready' | 'error'
export type NuxtJpUiProcessStepState = 'upcoming' | 'current' | 'complete' | 'error'

export interface NuxtJpUiMetric {
  label: string
  value: string | number
}

export interface NuxtJpUiProcessStep {
  value: string
  slot?: string
  title: string
  description?: string
  state?: NuxtJpUiProcessStepState
  disabled?: boolean
}

export function nuxtJpUiTransport(
  status: string, data: unknown, error: unknown
): NuxtJpUiTransport {
  if (error || status === 'error') return 'error'
  if (status === 'idle' || status === 'pending') return 'loading'
  return data === undefined || data === null ? 'error' : 'ready'
}

export function nuxtJpUiReadState(
  status: string, data: unknown, error: unknown
): NuxtJpUiReadState {
  const transport = nuxtJpUiTransport(status, data, error)
  return transport === 'loading' ? 'pending' : transport
}
