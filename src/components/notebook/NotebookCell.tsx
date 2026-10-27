import {
  ArrowDown,
  ArrowUp,
  CircleAlert,
  Code2,
  Copy,
  Eraser,
  Play,
  Trash2,
  Type,
} from 'lucide-react'
import { ResultPanel } from '@/components/results/ResultPanel'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatDuration, formatNumber } from '@/lib/format'
import { focusEditor } from '@/lib/editorRegistry'
import { cn } from '@/lib/utils'
import { useDbStore } from '@/store/db'
import { useNotebookStore } from '@/store/notebook'
import { useSettingsStore } from '@/store/settings'
import type { NotebookCell, SchemaTable } from '@/types'
import { MarkdownCell } from './MarkdownCell'
import { SqlEditor } from '../editor/SqlEditor'

const NO_TABLES: SchemaTable[] = []

interface NotebookCellProps {
  cell: NotebookCell
  index: number
  total: number
}

export function NotebookCell({ cell, index, total }: NotebookCellProps) {
  const run = useNotebookStore((state) => state.runs[cell.id])
  const active = useNotebookStore((state) => state.activeCellId === cell.id)
  const tables = useDbStore((state) => state.schema?.tables) ?? NO_TABLES
  const runCell = useNotebookStore((state) => state.runCell)
  const updateCell = useNotebookStore((state) => state.updateCell)
  const setActiveCell = useNotebookStore((state) => state.setActiveCell)
  const setCellType = useNotebookStore((state) => state.setCellType)
  const removeCell = useNotebookStore((state) => state.removeCell)
  const duplicateCell = useNotebookStore((state) => state.duplicateCell)
  const moveCell = useNotebookStore((state) => state.moveCell)
  const clearRuns = useNotebookStore((state) => state.clearRuns)
  const markdownEnabled = useSettingsStore((state) => state.markdownEnabled)

  const running = run?.status === 'running'
  const rowCount =
    run?.results.reduce(
      (totalRows, result) =>
        totalRows +
        (result.rows.length > 0 ? result.rows.length : (result.affectedRows ?? result.rowCount ?? 0)),
      0,
    ) ?? 0

  const advance = () => {
    const state = useNotebookStore.getState()
    const currentIndex = state.cells.findIndex((item) => item.id === cell.id)
    const next = state.cells[currentIndex + 1]

    if (next?.type === 'sql') {
      state.setActiveCell(next.id)
      window.setTimeout(() => focusEditor(next.id), 30)
      return
    }

    const id = state.addCell(cell.id, 'sql', '')
    window.setTimeout(() => focusEditor(id), 70)
  }

  const runAndAdvance = () => {
    if (!cell.source.trim() || running) return
    void runCell(cell.id)
    advance()
  }

  const runAndInsert = () => {
    if (!cell.source.trim() || running) return
    void runCell(cell.id)
    const id = useNotebookStore.getState().addCell(cell.id, 'sql', '')
    window.setTimeout(() => focusEditor(id), 70)
  }

  return (
    <section
      id={`cell-${cell.id}`}
      onMouseDown={() => setActiveCell(cell.id)}
      className={cn(
        'group/cell relative rounded-xl border bg-card/50 transition-colors',
        active
          ? 'border-primary/35 ring-1 ring-primary/15'
          : 'border-border/60 hover:border-border',
      )}
    >
      <header className="flex h-8 select-none items-center gap-1 border-b border-border/40 bg-muted/15 px-1.5">
        {cell.type === 'sql' ? (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => void runCell(cell.id)}
                  disabled={!cell.source.trim() || running}
                  className="text-success hover:bg-success/10 hover:text-success"
                  aria-label="Run cell"
                >
                  {running ? (
                    <Spinner className="size-3" />
                  ) : (
                    <Play className="size-3 fill-current" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Run cell <span className="opacity-60">· Ctrl/⌘ + Enter</span>
              </TooltipContent>
            </Tooltip>

            <span className="w-10 font-mono text-[9.5px] text-muted-foreground/65">
              In [{run?.executionCount ?? ' '}]
            </span>
          </>
        ) : (
          <span className="flex items-center gap-1 px-1 text-[10px] text-muted-foreground">
            <Type className="size-3" />
            Markdown
          </span>
        )}

        {cell.type === 'sql' && run?.status === 'success' ? (
          <div className="flex items-center gap-1.5 font-mono text-[9.5px] text-muted-foreground/65">
            <span className="text-success">●</span>
            <span>{formatDuration(run.durationMs)}</span>
            {rowCount > 0 ? (
              <>
                <span className="text-muted-foreground/30">•</span>
                <span>{formatNumber(rowCount)} rows</span>
              </>
            ) : null}
          </div>
        ) : null}

        {cell.type === 'sql' && run?.status === 'error' ? (
          <span className="flex items-center gap-1 font-mono text-[9.5px] text-destructive/90">
            <CircleAlert className="size-3" />
            error
            {run.durationMs !== undefined ? (
              <span className="text-destructive/60">• {formatDuration(run.durationMs)}</span>
            ) : null}
          </span>
        ) : null}

        {cell.type === 'sql' && running ? (
          <span className="font-mono text-[9.5px] text-muted-foreground/60">running…</span>
        ) : null}

        <div className="ml-auto flex items-center gap-0.5 opacity-40 transition-opacity group-hover/cell:opacity-100 focus-within:opacity-100">
          {cell.type === 'sql' ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => clearRuns(cell.id)}
                  disabled={!run || running}
                  aria-label="Clear cell output"
                >
                  <Eraser className="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear output</TooltipContent>
            </Tooltip>
          ) : null}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => duplicateCell(cell.id)}
                aria-label="Duplicate cell"
              >
                <Copy className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Duplicate</TooltipContent>
          </Tooltip>

          {cell.type === 'markdown' || markdownEnabled ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setCellType(cell.id, cell.type === 'sql' ? 'markdown' : 'sql')}
                  aria-label={cell.type === 'sql' ? 'Convert to markdown' : 'Convert to SQL'}
                >
                  {cell.type === 'sql' ? (
                    <Type className="size-3" />
                  ) : (
                    <Code2 className="size-3" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Convert to {cell.type === 'sql' ? 'markdown' : 'SQL'}
              </TooltipContent>
            </Tooltip>
          ) : null}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => moveCell(cell.id, 'up')}
                disabled={index === 0}
                aria-label="Move cell up"
              >
                <ArrowUp className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move up</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => moveCell(cell.id, 'down')}
                disabled={index === total - 1}
                aria-label="Move cell down"
              >
                <ArrowDown className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move down</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => removeCell(cell.id)}
                className="hover:bg-destructive/10 hover:text-destructive"
                aria-label="Delete cell"
              >
                <Trash2 className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete cell</TooltipContent>
          </Tooltip>
        </div>
      </header>

      <div className={cn('px-2.5', cell.type === 'sql' ? 'py-1' : 'py-1.5')}>
        {cell.type === 'sql' ? (
          <SqlEditor
            cellId={cell.id}
            value={cell.source}
            tables={tables}
            onChange={(value) => updateCell(cell.id, { source: value })}
            onRun={() => void runCell(cell.id)}
            onRunAndNext={runAndAdvance}
            onRunAndInsert={runAndInsert}
            onFocus={() => setActiveCell(cell.id)}
          />
        ) : (
          <MarkdownCell cell={cell} />
        )}
      </div>

      {cell.type === 'sql' && run && run.status !== 'idle' ? (
        <div className="border-t border-border/40 px-2.5 py-2">
          <ResultPanel run={run} />
        </div>
      ) : null}
    </section>
  )
}
