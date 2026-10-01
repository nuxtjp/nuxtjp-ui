<script setup lang="ts">
import { ref } from 'vue'
import { attemptNuxtJpClipboardCopy } from '../../core'

const props = withDefaults(defineProps<{
  text: string
  disabled?: boolean
  idleLabel?: string
  copiedLabel?: string
}>(), { disabled: false, idleLabel: 'コピー', copiedLabel: 'コピー済み' })
const state = ref<'idle' | 'copied' | 'manual'>('idle')
async function copy() {
  if (props.disabled) return
  state.value = await attemptNuxtJpClipboardCopy(props.text, navigator.clipboard)
  if (state.value === 'copied') window.setTimeout(() => { state.value = 'idle' }, 2_000)
}
function selectText(event: Event) {
  if (event.currentTarget instanceof HTMLTextAreaElement) event.currentTarget.select()
}
</script>

<template>
  <div class="grid gap-3">
    <UButton type="button" color="neutral" variant="outline" icon="i-lucide-copy"
      :disabled="disabled" class="w-fit" @click="copy">
      {{ state === 'copied' ? copiedLabel : idleLabel }}
    </UButton>
    <UAlert v-if="state === 'manual'" color="warning" variant="subtle"
      title="自動コピーを利用できません" role="alert">
      <template #description>
        <p class="mb-3">下の欄を選択して手動でコピーしてください。</p>
        <UTextarea :model-value="text" readonly aria-label="手動コピー用テキスト"
          :rows="4" class="w-full font-mono" @focus="selectText" @click="selectText" />
      </template>
    </UAlert>
  </div>
</template>
