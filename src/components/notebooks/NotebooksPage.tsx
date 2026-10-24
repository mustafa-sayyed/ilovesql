import { ArrowUpRight, BookOpen, Code2, Plus, Trash2, Type } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { focusEditor } from '@/lib/editorRegistry'
import { pluralize, relativeTime } from '@/lib/format'
import { useNotebookStore } from '@/store/notebook'
import type { SavedNotebook } from '@/types'
import { toast } from 'sonner'

function NotebookCard({
  notebook,
  isCurrent = false,
  onOpen,
  onDelete,
}: {
  notebook: SavedNotebook
  isCurrent?: boolean
  onOpen: () => void
  onDelete: () => void
}) {
  const sqlCount = notebook.cells.filter((cell) => cell.type === 'sql').length
  const noteCount = notebook.cells.length - sqlCount
  const previewCell = notebook.cells.find((cell) => cell.source.trim().length > 0)

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border/60 bg-card/50 transition-colors hover:border-border">
      <button
        type="button"
        onClick={onOpen}
        className="flex min-h-[148px] flex-1 cursor-pointer flex-col p-4 text-left"
        aria-label={`Open ${notebook.title}`}
      >
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="size-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-heading text-[13px] font-semibold">{notebook.title}</h2>
            <p className="mt-1 text-[10px] text-muted-foreground/75">
              {notebook.savedAt > 0 ? `Saved ${relativeTime(notebook.savedAt)}` : 'Saved just now'}
            </p>
          </div>
        </div>

        <p className="mt-3 line-clamp-3 min-h-[42px] whitespace-pre-wrap font-mono text-[10.5px] leading-relaxed text-muted-foreground/80">
          {previewCell?.source.trim() || 'Empty notebook'}
        </p>

        <div className="mt-auto flex items-center gap-3 pt-3 text-[10px] text-muted-foreground/70">
          <span className="flex items-center gap-1">
            <Code2 className="size-3" />
            {sqlCount} {pluralize(sqlCount, 'query', 'queries')}
          </span>
          {noteCount > 0 ? (
            <span className="flex items-center gap-1">
              <Type className="size-3" />
              {noteCount} {pluralize(noteCount, 'note')}
            </span>
          ) : null}
        </div>
      </button>

      <div className="flex items-center border-t border-border/50 p-1.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpen}
          className="h-7 flex-1 justify-start gap-1 text-[11px] text-muted-foreground"
        >
          <ArrowUpRight className="size-3" />
          Open notebook
        </Button>
        {isCurrent ? null : (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onDelete}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete ${notebook.title}`}
          >
            <Trash2 className="size-3.5" />
          </Button>
        )}
      </div>
    </article>
  )
}

export function NotebooksPage() {
  const navigate = useNavigate()
  const notebookId = useNotebookStore((state) => state.notebookId)
  const title = useNotebookStore((state) => state.title)
  const cells = useNotebookStore((state) => state.cells)
  const activeCellId = useNotebookStore((state) => state.activeCellId)
  const savedNotebooks = useNotebookStore((state) => state.savedNotebooks)
  const createNotebook = useNotebookStore((state) => state.createNotebook)
  const openNotebook = useNotebookStore((state) => state.openNotebook)
  const deleteNotebook = useNotebookStore((state) => state.deleteNotebook)
  const [pendingDelete, setPendingDelete] = useState<SavedNotebook | null>(null)

  const currentNotebook: SavedNotebook = {
    id: notebookId,
    title: title.trim() || 'Untitled notebook',
    cells,
    activeCellId,
    savedAt: 0,
  }
  const notebooks = [
    currentNotebook,
    ...savedNotebooks.filter((notebook) => notebook.id !== notebookId),
  ]

  const goToNotebook = (targetId: string, cellId: string | null) => {
    navigate(`/notebooks/${targetId}`)
    window.setTimeout(() => {
      document.getElementById('notebook-scroll')?.scrollTo({ top: 0 })
      if (cellId) focusEditor(cellId)
    }, 120)
  }

  const handleOpen = (notebook: SavedNotebook, isCurrent = false) => {
    if (isCurrent) {
      goToNotebook(notebook.id, useNotebookStore.getState().activeCellId)
      return
    }

    const activeCellId = openNotebook(notebook.id)
    if (useNotebookStore.getState().notebookId !== notebook.id) {
      toast.error('That notebook could not be opened')
      return
    }

    const focusCell =
      notebook.cells.find((cell) => cell.id === activeCellId && cell.type === 'sql') ??
      notebook.cells.find((cell) => cell.type === 'sql')

    goToNotebook(notebook.id, focusCell?.id ?? activeCellId)
    toast.success('Notebook opened')
  }

  const handleCreate = () => {
    const targetId = createNotebook()
    goToNotebook(targetId, useNotebookStore.getState().activeCellId)
    toast.success('New notebook ready')
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-[22px] font-semibold tracking-tight">
            All notebooks
          </h1>
          <p className="mt-1 text-[11px] text-muted-foreground/75">
            {`${notebooks.length} ${pluralize(
              notebooks.length,
              'notebook',
            )} stored in this browser`}
          </p>
        </div>
        <Button size="sm" onClick={handleCreate} className="gap-1.5">
          <Plus className="size-3.5" />
          New notebook
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {notebooks.map((notebook) => {
          const isCurrent = notebook.id === notebookId
          return (
            <NotebookCard
              key={notebook.id}
              notebook={notebook}
              isCurrent={isCurrent}
              onOpen={() => handleOpen(notebook, isCurrent)}
              onDelete={() => setPendingDelete(notebook)}
            />
          )
        })}
      </div>

      <p className="mt-6 text-center text-[10px] text-muted-foreground/55">
        Notebooks are stored locally in this browser. Clearing site data removes them.
      </p>

      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this notebook?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `"${pendingDelete.title}" will be removed from this browser. This cannot be undone.`
                : 'This notebook will be removed from this browser.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (!pendingDelete) return
                deleteNotebook(pendingDelete.id)
                toast.success('Notebook deleted')
                setPendingDelete(null)
              }}
            >
              Delete notebook
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
