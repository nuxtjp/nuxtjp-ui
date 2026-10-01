<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { computed, h, ref, resolveComponent } from 'vue'
import type { NuxtJpDataTableColumn, NuxtJpDataTableRow } from '../../core'

interface FlatRow { id: string, __action?: NuxtJpDataTableRow['action'], [key: string]: unknown }
const props = withDefaults(defineProps<{ columns: NuxtJpDataTableColumn[], rows: NuxtJpDataTableRow[],
  searchLabel?: string, emptyMessage?: string }>(), { searchLabel: '表を検索',
  emptyMessage: '条件に一致する項目はありません。' })
const query = ref('')
const sorting = ref<Array<{ id: string, desc: boolean }>>([])
const button = resolveComponent('UButton')
const data = computed<FlatRow[]>(() => props.rows.map(row =>
  ({ id: row.id, ...row.values, __action: row.action })))
const columns = computed<TableColumn<FlatRow>[]>(() => {
  const declared = props.columns.map((item): TableColumn<FlatRow> => ({
    accessorKey: item.key,
    enableGlobalFilter: item.searchable !== false,
    enableSorting: item.sortable !== false,
    header: ({ column }) => item.sortable === false ? item.label : h(button, {
      color: 'neutral', variant: 'ghost', size: 'sm', label: item.label,
      icon: column.getIsSorted() === 'asc' ? 'i-lucide-arrow-up'
        : column.getIsSorted() === 'desc' ? 'i-lucide-arrow-down' : 'i-lucide-arrow-up-down',
      'aria-label': `${item.label}で並べ替え`,
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
    }),
    cell: ({ row }) => item.presentation === 'code'
      ? h('code', { class: 'nuxtjp-data-table-code' }, String(row.getValue(item.key) ?? ''))
      : String(row.getValue(item.key) ?? '')
  }))
  if (!props.rows.some(row => row.action)) return declared
  return [...declared, { id: '__action', enableGlobalFilter: false, enableSorting: false,
    header: '操作', cell: ({ row }) => row.original.__action ? h(button, {
      to: row.original.__action.to, variant: 'outline', size: 'sm',
      label: row.original.__action.label
    }) : '' }]
})
</script>

<template>
  <section class="nuxtjp-data-table" aria-label="検索と並べ替えができる表">
    <UFormField :label="searchLabel" class="nuxtjp-data-table-search">
      <UInput v-model="query" icon="i-lucide-search" autocomplete="off" />
    </UFormField>
    <UTable v-model:global-filter="query" v-model:sorting="sorting" :data="data"
      :columns="columns" :empty="emptyMessage" sticky="header" />
  </section>
</template>

<style scoped>
.nuxtjp-data-table { display: grid; gap: 1rem; min-width: 0; }
.nuxtjp-data-table-search { max-width: 30rem; }
:deep(.nuxtjp-data-table-code) { font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: .82rem; overflow-wrap: anywhere; }
</style>
