<script setup lang="ts">
import { computed } from 'vue'
import type {
  NuxtJpUiColor, NuxtJpUiLocale, NuxtJpUiProcessStep, NuxtJpUiProcessStepState
} from '../../core'
import { useNuxtJpLocale } from '../composables/useNuxtJpLocale'

const activeId = defineModel<string>({ required: true })
const props = withDefaults(defineProps<{
  items: NuxtJpUiProcessStep[]
  linear?: boolean
  locale?: NuxtJpUiLocale
  previousLabel?: string
  nextLabel?: string
}>(), { linear: false })
const configuredLocale = useNuxtJpLocale()
const locale = computed(() => props.locale ?? configuredLocale.value)
const text = computed(() => locale.value === 'en' ? {
  upcoming: 'Upcoming', current: 'Current', complete: 'Complete', error: 'Error',
  previous: 'Previous', next: 'Next', progress: 'Step'
} : {
  upcoming: '未着手', current: '現在', complete: '完了', error: 'エラー',
  previous: '前の手順', next: '次の手順', progress: '手順'
})
const icons: Record<NuxtJpUiProcessStepState, string> = {
  upcoming: 'i-lucide-circle', current: 'i-lucide-circle-dot',
  complete: 'i-lucide-circle-check', error: 'i-lucide-circle-alert'
}
const colors: Record<NuxtJpUiProcessStepState, NuxtJpUiColor> = {
  upcoming: 'neutral', current: 'primary', complete: 'success', error: 'error'
}
const activeIndex = computed(() => props.items.findIndex(step => step.value === activeId.value))
function stateFor(step: NuxtJpUiProcessStep, index: number): NuxtJpUiProcessStepState {
  if (step.state) return step.state
  if (index < activeIndex.value) return 'complete'
  return index === activeIndex.value ? 'current' : 'upcoming'
}
const stepperItems = computed(() => props.items.map((step, index) => {
  const state = stateFor(step, index)
  return {
    value: step.value,
    title: step.title,
    description: [step.description, text.value[state]].filter(Boolean).join(' · '),
    icon: icons[state],
    ...(step.slot ? { slot: step.slot } : {}),
    ...(step.disabled === undefined ? {} : { disabled: step.disabled })
  }
}))
const activeStep = computed(() => props.items[activeIndex.value])
const activeState = computed(() => activeStep.value
  ? stateFor(activeStep.value, activeIndex.value) : 'upcoming')
function adjacentIndex(offset: -1 | 1) {
  for (let index = activeIndex.value + offset; index >= 0 && index < props.items.length; index += offset) {
    if (!props.items[index]?.disabled) return index
  }
  return -1
}
function move(offset: -1 | 1) {
  const next = props.items[adjacentIndex(offset)]
  if (next) activeId.value = next.value
}
</script>

<template>
  <UCard variant="subtle">
    <UStepper v-model="activeId" :items="stepperItems" :linear="linear"
      color="primary" size="lg" />
    <div v-if="activeStep" class="mt-6">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <UBadge :color="colors[activeState]" variant="subtle">
          {{ text[activeState] }}
        </UBadge>
        <span class="text-sm text-muted" aria-live="polite">
          {{ text.progress }} {{ activeIndex + 1 }} / {{ items.length }}
        </span>
      </div>
      <slot :name="activeStep.slot ?? activeStep.value" :step="activeStep" />
    </div>
    <template #footer>
      <div class="flex items-center justify-between gap-4">
        <UButton color="neutral" variant="outline" :disabled="adjacentIndex(-1) < 0"
          @click="move(-1)">{{ previousLabel ?? text.previous }}</UButton>
        <UButton :disabled="adjacentIndex(1) < 0"
          @click="move(1)">{{ nextLabel ?? text.next }}</UButton>
      </div>
    </template>
  </UCard>
</template>
