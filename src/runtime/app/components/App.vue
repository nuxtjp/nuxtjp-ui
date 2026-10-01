<script setup lang="ts">
import { en, ja } from '@nuxt/ui/locale'
import { useHead } from '#imports'
import { computed } from 'vue'
import { useNuxtJpLocale } from '../composables/useNuxtJpLocale'

const props = withDefaults(defineProps<{ toasterProgress?: boolean }>(), {
  toasterProgress: false,
})
const localeCode = useNuxtJpLocale()
const locale = computed(() => localeCode.value === 'en' ? en : ja)
const toaster = computed(() => ({ progress: props.toasterProgress }))
useHead(() => ({ htmlAttrs: { lang: localeCode.value } }))
</script>

<template>
  <UApp :locale="locale" :toaster="toaster"><slot /></UApp>
</template>
