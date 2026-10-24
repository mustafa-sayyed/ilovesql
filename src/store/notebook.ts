import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { executeSql, shouldRefreshSchema, toQueryError } from '@/lib/db/execute'
import type {
  CellRun,
  CellType,
  NotebookCell,
  QueryResultSet,
  RunOutcome,
  RunSummary,
  SavedNotebook,
} from '@/types'
import { useDbStore } from './db'
import { useHistoryStore } from './history'
import { useSettingsStore } from './settings'

const WELCOME = `# Welcome to ilovesql

A local SQL notebook. Every cell runs **PostgreSQL** compiled to WebAssembly — no server, no network.

- **Shift + Enter** run the cell and move to the next one
- **Cmd/Ctrl + Enter** run the current cell
- **Cmd/Ctrl + K** open the command palette

The demo database is a small storefront. Explore its schema on the left, then try editing a query.`

const TOP_CUSTOMERS = `SELECT
  cu.name AS customer,
  cu.country,
  count(o.id) AS orders,
  round(coalesce(sum(o.total), 0), 2) AS lifetime_value
FROM customers cu
LEFT JOIN orders o ON o.customer_id = cu.id
GROUP BY cu.id, cu.name, cu.country
ORDER BY lifetime_value DESC
LIMIT 10;`

const MONTHLY_REVENUE = `SELECT
  date_trunc('month', ordered_at)::date AS month,
  count(*) AS orders,
  round(sum(total), 2) AS revenue
FROM orders
WHERE status <> 'cancelled'
GROUP BY 1
ORDER BY 1;`

function createId(): string {
  return crypto.randomUUID()
}

function createStarterCells(): NotebookCell[] {
  return [
    { id: createId(), type: 'markdown', source: WELCOME },
    { id: createId(), type: 'sql', source: TOP_CUSTOMERS },
    { id: createId(), type: 'sql', source: MONTHLY_REVENUE },
  ]
}

function createBlankCells(): NotebookCell[] {
  return [{ id: createId(), type: 'sql', source: '' }]
}

function countResultRows(results: QueryResultSet[]): number {
  return results.reduce((total, result) => {
    if (result.rows.length > 0) return total + result.rows.length
    return total + (result.rowCount ?? result.affectedRows ?? 0)
  }, 0)
}

const starterCells = createStarterCells()
const starterNotebookId = createId()
const MAX_SAVED_NOTEBOOKS = 30

export function getNotebookCount(state: {
  notebookId: string
  savedNotebooks: SavedNotebook[]
}): number {
  return state.savedNotebooks.some((notebook) => notebook.id === state.notebookId)
    ? state.savedNotebooks.length
    : state.savedNotebooks.length + 1
}

interface NotebookState {
  notebookId: string
  title: string
  cells: NotebookCell[]
  activeCellId: string | null
  savedNotebooks: SavedNotebook[]
  runs: Record<string, CellRun>
  executionCount: number
  isRunningAll: boolean
  addCell: (afterId?: string | null, type?: CellType, source?: string) => string
  addQueryCell: (sql: string, afterId?: string | null) => string
  updateCell: (id: string, patch: Partial<Pick<NotebookCell, 'source' | 'type'>>) => void
  setCellType: (id: string, type: CellType) => void
  removeCell: (id: string) => void
  duplicateCell: (id: string) => string | null
  moveCell: (id: string, direction: 'up' | 'down') => void
  setActiveCell: (id: string) => void
  setTitle: (title: string) => void
  runCell: (id: string, options?: { refreshSchema?: boolean }) => Promise<RunOutcome>
  runAll: () => Promise<RunSummary>
  clearRuns: (id?: string) => void
  createNotebook: () => string
  openNotebook: (id: string) => string | null
  deleteNotebook: (id: string) => void
}

function archiveCurrentNotebook(state: NotebookState): SavedNotebook[] {
  const hasContent = state.cells.some((cell) => cell.source.trim().length > 0)
  const hasCustomTitle = state.title.trim().length > 0 && state.title.trim() !== 'Untitled notebook'

  if (!hasContent && !hasCustomTitle) {
    return state.savedNotebooks
  }

  const saved: SavedNotebook = {
    id: state.notebookId,
    title: state.title.trim() || 'Untitled notebook',
    cells: state.cells,
    activeCellId: state.activeCellId,
    savedAt: Date.now(),
  }

  return [saved, ...state.savedNotebooks.filter((notebook) => notebook.id !== state.notebookId)].slice(
    0,
    MAX_SAVED_NOTEBOOKS,
  )
}

export const useNotebookStore = create<NotebookState>()(
  persist(
    (set, get) => ({
      notebookId: starterNotebookId,
      title: 'Untitled notebook',
      cells: starterCells,
      activeCellId: starterCells[1]?.id ?? starterCells[0]?.id ?? null,
      savedNotebooks: [],
      runs: {},
      executionCount: 0,
      isRunningAll: false,

      addCell: (afterId, type = 'sql', source = '') => {
        const id = createId()
        const cell: NotebookCell = { id, type, source }

        set((state) => {
          if (!afterId) {
            return { cells: [...state.cells, cell], activeCellId: id }
          }

          const index = state.cells.findIndex((item) => item.id === afterId)
          if (index === -1) {
            return { cells: [...state.cells, cell], activeCellId: id }
          }

          const cells = [...state.cells]
          cells.splice(index + 1, 0, cell)
          return { cells, activeCellId: id }
        })

        return id
      },

      addQueryCell: (sql, afterId) => get().addCell(afterId, 'sql', sql),

      updateCell: (id, patch) =>
        set((state) => ({
          cells: state.cells.map((cell) => (cell.id === id ? { ...cell, ...patch } : cell)),
        })),

      setCellType: (id, type) =>
        set((state) => {
          const runs = { ...state.runs }
          delete runs[id]
          return {
            cells: state.cells.map((cell) => (cell.id === id ? { ...cell, type } : cell)),
            runs,
          }
        }),

      removeCell: (id) =>
        set((state) => {
          const index = state.cells.findIndex((cell) => cell.id === id)
          const cells = state.cells.filter((cell) => cell.id !== id)
          const runs = { ...state.runs }
          delete runs[id]

          let activeCellId = state.activeCellId
          if (activeCellId === id) {
            activeCellId = cells[Math.min(Math.max(index, 0), cells.length - 1)]?.id ?? null
          }

          return { cells, runs, activeCellId }
        }),

      duplicateCell: (id) => {
        const state = get()
        const index = state.cells.findIndex((cell) => cell.id === id)
        if (index === -1) return null

        const source = state.cells[index]
        const newId = createId()
        const copy: NotebookCell = { ...source, id: newId }
        const cells = [...state.cells]
        cells.splice(index + 1, 0, copy)
        set({ cells, activeCellId: newId })
        return newId
      },

      moveCell: (id, direction) =>
        set((state) => {
          const markdownEnabled = useSettingsStore.getState().markdownEnabled
          const visibleCells = markdownEnabled
            ? state.cells
            : state.cells.filter((cell) => cell.type === 'sql')

          const index = visibleCells.findIndex((cell) => cell.id === id)
          if (index === -1) return state

          const adjacent = visibleCells[direction === 'up' ? index - 1 : index + 1]
          if (!adjacent) return state

          const from = state.cells.findIndex((cell) => cell.id === id)
          const to = state.cells.findIndex((cell) => cell.id === adjacent.id)
          if (from === -1 || to === -1) return state

          const cells = [...state.cells]
          const [cell] = cells.splice(from, 1)
          cells.splice(to, 0, cell)
          return { cells }
        }),

      setActiveCell: (id) => set({ activeCellId: id }),

      setTitle: (title) => set({ title }),

      runCell: async (id, options) => {
        const state = get()
        const cell = state.cells.find((item) => item.id === id)

        if (!cell || cell.type !== 'sql') return 'skipped'
        if (!cell.source.trim()) return 'skipped'
        if (state.runs[id]?.status === 'running') return 'skipped'
        if (useDbStore.getState().status !== 'ready') return 'skipped'

        const executionCount = state.executionCount + 1
        const startedAt = Date.now()

        set((current) => ({
          executionCount,
          runs: {
            ...current.runs,
            [id]: {
              status: 'running',
              results: [],
              startedAt,
              executionCount,
            },
          },
        }))

        try {
          const { results, durationMs } = await executeSql(cell.source)
          const finishedAt = Date.now()

          set((current) => ({
            runs: {
              ...current.runs,
              [id]: {
                status: 'success',
                results,
                durationMs,
                startedAt,
                finishedAt,
                executionCount,
              },
            },
          }))

          useHistoryStore.getState().add({
            cellId: id,
            sql: cell.source,
            status: 'success',
            durationMs,
            rowCount: countResultRows(results),
            timestamp: finishedAt,
          })

          if ((options?.refreshSchema ?? true) && shouldRefreshSchema(results)) {
            void useDbStore.getState().refreshSchema()
          }

          return 'success'
        } catch (error) {
          const finishedAt = Date.now()
          const durationMs = Math.max(0, finishedAt - startedAt)
          const info = toQueryError(error)

          set((current) => ({
            runs: {
              ...current.runs,
              [id]: {
                status: 'error',
                results: [],
                error: info,
                durationMs,
                startedAt,
                finishedAt,
                executionCount,
              },
            },
          }))

          useHistoryStore.getState().add({
            cellId: id,
            sql: cell.source,
            status: 'error',
            durationMs,
            rowCount: 0,
            error: info.message,
            timestamp: finishedAt,
          })

          return 'error'
        }
      },

      runAll: async () => {
        if (get().isRunningAll) {
          return { total: 0, succeeded: 0, failed: 0 }
        }

        const ids = get()
          .cells.filter((cell) => cell.type === 'sql' && cell.source.trim().length > 0)
          .map((cell) => cell.id)

        set({ isRunningAll: true })

        let succeeded = 0
        let failed = 0

        for (const id of ids) {
          const outcome = await get().runCell(id, { refreshSchema: false })
          if (outcome === 'success') succeeded += 1
          if (outcome === 'error') failed += 1
        }

        if (ids.length > 0) {
          await useDbStore.getState().refreshSchema()
        }

        set({ isRunningAll: false })
        return { total: ids.length, succeeded, failed }
      },

      clearRuns: (id) =>
        set((state) => {
          if (!id) return { runs: {} }
          const runs = { ...state.runs }
          delete runs[id]
          return { runs }
        }),

      createNotebook: () => {
        const state = get()
        const savedNotebooks = archiveCurrentNotebook(state)
        const cells = createBlankCells()
        const notebookId = createId()

        set({
          notebookId,
          savedNotebooks,
          title: 'Untitled notebook',
          cells,
          activeCellId: cells[0]?.id ?? null,
          runs: {},
          executionCount: 0,
          isRunningAll: false,
        })

        return notebookId
      },

      openNotebook: (id) => {
        const state = get()
        const notebook = state.savedNotebooks.find((item) => item.id === id)
        if (!notebook) return null

        const savedNotebooks = archiveCurrentNotebook(state).filter((item) => item.id !== id)
        const activeCellId = notebook.cells.some((cell) => cell.id === notebook.activeCellId)
          ? notebook.activeCellId
          : (notebook.cells[0]?.id ?? null)

        set({
          notebookId: notebook.id,
          savedNotebooks,
          title: notebook.title,
          cells: notebook.cells,
          activeCellId,
          runs: {},
          executionCount: 0,
          isRunningAll: false,
        })

        return activeCellId
      },

      deleteNotebook: (id) =>
        set((state) => ({
          savedNotebooks: state.savedNotebooks.filter((notebook) => notebook.id !== id),
        })),
    }),
    {
      name: 'ilovesql-notebook-v1',
      version: 1,
      partialize: (state) => ({
        notebookId: state.notebookId,
        title: state.title,
        cells: state.cells,
        activeCellId: state.activeCellId,
        savedNotebooks: state.savedNotebooks,
      }),
    },
  ),
)
