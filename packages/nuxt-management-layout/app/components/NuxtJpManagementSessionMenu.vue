<script setup lang="ts">
import type { ManagementPerspective } from '../../core'

const props = defineProps<{ items: ManagementPerspective[], activeId?: string,
  label: string, badge?: string }>()
const active = computed(() => props.items.find(item => item.id === props.activeId))
const route = useRoute()
const open = ref(false)
watch(() => route.fullPath, () => { open.value = false })
</script>

<template>
  <UPopover v-model:open="open" :content="{ side: 'top', align: 'start', sideOffset: 8 }">
    <button type="button" class="nuxtjp-management-session-trigger"
      aria-label="管理セッションと表示レイヤー">
      <span class="nuxtjp-management-session-avatar" aria-hidden="true">
        <UIcon name="i-lucide-user-round" />
      </span>
      <span class="nuxtjp-management-session-copy">
        <strong>{{ label }}</strong>
        <small>{{ active?.label ?? '表示レイヤーを選択' }}</small>
      </span>
      <UBadge v-if="badge" color="neutral" variant="subtle">{{ badge }}</UBadge>
      <UIcon name="i-lucide-chevrons-up-down" aria-hidden="true" />
    </button>
    <template #content>
      <section class="nuxtjp-management-session-menu" aria-label="管理セッション">
        <header>
          <p>表示レイヤー</p>
          <strong>{{ active?.label ?? '未選択' }}</strong>
        </header>
        <nav class="nuxtjp-management-session-options" aria-label="表示レイヤー">
          <NuxtLink v-for="item in items" :key="item.id" :to="item.home"
            class="nuxtjp-management-session-option"
            :class="{ 'nuxtjp-management-session-option-active': item.id === activeId }"
            :aria-current="item.id === activeId ? 'page' : undefined">
            <span>
              <strong>{{ item.label }}</strong>
              <small>{{ item.description }}</small>
            </span>
            <UIcon v-if="item.id === activeId" name="i-lucide-check" aria-hidden="true" />
          </NuxtLink>
        </nav>
        <footer v-if="badge">
          <UIcon name="i-lucide-shield-check" aria-hidden="true" />
          <span>この端末のローカル管理セッション</span>
          <UBadge color="neutral" variant="subtle">{{ badge }}</UBadge>
        </footer>
      </section>
    </template>
  </UPopover>
</template>
