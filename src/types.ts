export type CellType = 'sql' | 'markdown'

export interface NotebookCell {
  id: string
  type: CellType
  source: string
}

export interface SavedNotebook {
  id: string
  title: string
  cells: NotebookCell[]
  activeCellId: string | null
  savedAt: number
}

export interface QueryField {
  name: string
  dataTypeID: number
}

export interface QueryResultSet {
  rows: Record<string, unknown>[]
  fields: QueryField[]
  command?: string
  affectedRows?: number
  rowCount?: number
}

export type RunStatus = 'idle' | 'running' | 'success' | 'error'

export interface QueryErrorInfo {
  message: string
  code?: string
  detail?: string
  hint?: string
  position?: string
}

export interface CellRun {
  status: RunStatus
  results: QueryResultSet[]
  durationMs?: number
  error?: QueryErrorInfo
  startedAt?: number
  finishedAt?: number
  executionCount?: number
}

export interface SchemaColumn {
  name: string
  dataType: string
  nullable: boolean
  default: string | null
  isPrimaryKey: boolean
}

export interface SchemaTable {
  schema: string
  name: string
  kind: 'table' | 'view'
  rowCount: number | null
  columns: SchemaColumn[]
}

export interface SchemaSnapshot {
  tables: SchemaTable[]
  databaseSize: number
  fetchedAt: number
}

export interface HistoryEntry {
  id: string
  cellId: string
  sql: string
  status: 'success' | 'error'
  durationMs: number
  rowCount: number
  error?: string
  timestamp: number
}

export type RunOutcome = 'success' | 'error' | 'skipped'

export interface RunSummary {
  total: number
  succeeded: number
  failed: number
}
