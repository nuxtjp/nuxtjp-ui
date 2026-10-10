<script setup lang="ts">
import type { ManagementPerspective } from '../../core'

defineProps<{ items: ManagementPerspective[], activeId?: string,
  label?: string, description?: string }>()
</script>

<template>
  <section class="nuxtjp-management-perspective-switcher">
    <p v-if="label" class="nuxtjp-management-perspective-label">{{ label }}</p>
    <nav class="nuxtjp-management-perspectives" aria-label="表示レイヤー">
      <NuxtLink v-for="item in items" :key="item.id" :to="item.home"
        class="nuxtjp-management-perspective"
        :class="{ 'nuxtjp-management-perspective-active': item.id === activeId }"
        :aria-current="item.id === activeId ? 'page' : undefined"
        :title="item.description">{{ item.label }}</NuxtLink>
    </nav>
    <p v-if="description" class="nuxtjp-management-perspective-description">
      {{ description }}
    </p>
  </section>
</template>
