import { Code2, FilePlus2, Plus, Type } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { focusEditor } from '@/lib/editorRegistry'
import { useNotebookStore } from '@/store/notebook'
import { useSettingsStore } from '@/store/settings'
import { NotebookCell } from './NotebookCell'

export function Notebook() {
  const title = useNotebookStore((state) => state.title)
  const cells = useNotebookStore((state) => state.cells)
  const activeCellId = useNotebookStore((state) => state.activeCellId)
  const setTitle = useNotebookStore((state) => state.setTitle)
  const addCell = useNotebookStore((state) => state.addCell)
  const markdownEnabled = useSettingsStore((state) => state.markdownEnabled)

  const visibleCells = markdownEnabled ? cells : cells.filter((cell) => cell.type === 'sql')
  const sqlCount = visibleCells.filter((cell) => cell.type === 'sql').length
  const markdownCount = visibleCells.length - sqlCount

  const add = (type: 'sql' | 'markdown', afterId = activeCellId) => {
    if (type === 'markdown' && !markdownEnabled) return
    const id = addCell(afterId, type)
    if (type === 'sql') {
      window.setTimeout(() => focusEditor(id), 70)
    }
    window.setTimeout(() => {
      document.getElementById(`cell-${id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }, 30)
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-5 pb-24 sm:px-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Untitled notebook"
            className="w-full min-w-0 truncate rounded-md bg-transparent font-heading text-[22px] font-semibold tracking-tight outline-none placeholder:text-muted-foreground/35 focus-visible:bg-muted/20"
            aria-label="Notebook title"
            spellCheck={false}
          />
          <p className="mt-1 text-[11px] text-muted-foreground/70">
            {sqlCount} {sqlCount === 1 ? 'query' : 'queries'}
            {markdownCount > 0
              ? ` · ${markdownCount} ${markdownCount === 1 ? 'note' : 'notes'}`
              : ''}
            <span className="mx-1.5 text-muted-foreground/35">·</span>
            autosaved in this browser
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => add('sql')}
            className="gap-1.5"
            aria-label="Add SQL cell"
          >
            <Code2 className="size-3.5" />
            <span className="hidden sm:inline">SQL</span>
          </Button>
          {markdownEnabled ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => add('markdown')}
              className="gap-1.5"
              aria-label="Add markdown cell"
            >
              <Type className="size-3.5" />
              <span className="hidden sm:inline">Markdown</span>
            </Button>
          ) : null}
        </div>
      </div>

      {visibleCells.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-card/30 px-6 py-16 text-center">
          <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FilePlus2 className="size-5" />
          </div>
          <h2 className="font-heading text-base font-medium">This notebook is empty</h2>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
            Add a SQL cell to query the demo database
            {markdownEnabled ? ', or a markdown cell to document what you find.' : '.'}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Button size="sm" onClick={() => add('sql')} className="gap-1.5">
              <Plus className="size-3.5" />
              New SQL cell
            </Button>
            {markdownEnabled ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => add('markdown')}
                className="gap-1.5"
              >
                <Type className="size-3.5" />
                New markdown cell
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleCells.map((cell, index) => (
            <NotebookCell
              key={cell.id}
              cell={cell}
              index={index}
              total={visibleCells.length}
            />
          ))}
        </div>
      )}

      {visibleCells.length > 0 ? (
        <div className="mt-3 flex items-center justify-center gap-1 rounded-xl border border-dashed border-border/50 py-1.5 opacity-55 transition-opacity hover:opacity-100">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-[11px] text-muted-foreground"
            onClick={() => add('sql', visibleCells[visibleCells.length - 1]?.id)}
          >
            <Plus className="size-3" />
            SQL
          </Button>
          {markdownEnabled ? (
            <>
              <div className="h-4 w-px bg-border/70" />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-[11px] text-muted-foreground"
                onClick={() => add('markdown', visibleCells[visibleCells.length - 1]?.id)}
              >
                <Type className="size-3" />
                Markdown
              </Button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
