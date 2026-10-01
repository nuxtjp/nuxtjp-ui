export type NuxtJpDataTableValue = string | number | null

export interface NuxtJpDataTableColumn {
  key: string
  label: string
  sortable?: boolean
  searchable?: boolean
  presentation?: 'text' | 'code'
}

export interface NuxtJpDataTableAction {
  label: string
  to: string
}

export interface NuxtJpDataTableRow {
  id: string
  values: Record<string, NuxtJpDataTableValue>
  action?: NuxtJpDataTableAction
}
