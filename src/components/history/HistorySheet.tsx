import { CircleAlert, CircleCheck, Copy, History, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { copyToClipboard } from '@/lib/export'
import { formatClock, formatDuration, formatNumber, pluralize, relativeTime } from '@/lib/format'
import { addCellAndFocus } from '@/lib/notebookActions'
import { cn } from '@/lib/utils'
import { useHistoryStore } from '@/store/history'
import { useNotebookStore } from '@/store/notebook'

type Filter = 'all' | 'success' | 'error'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'success', label: 'Success' },
  { value: 'error', label: 'Errors' },
]

export function HistorySheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const entries = useHistoryStore((state) => state.entries)
  const clear = useHistoryStore((state) => state.clear)

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return entries.filter((entry) => {
      if (filter !== 'all' && entry.status !== filter) return false
      return !needle || entry.sql.toLowerCase().includes(needle)
    })
  }, [entries, filter, search])

  const openInNotebook = (sql: string) => {
    const afterId = useNotebookStore.getState().activeCellId
    addCellAndFocus('sql', afterId, sql, 320)
    onOpenChange(false)
  }

  const copyEntry = (sql: string) => {
    void copyToClipboard(sql).then(() => toast.success('Query copied'))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 data-[side=right]:w-full sm:max-w-md"
      >
        <SheetHeader className="border-b border-border/60 px-4 py-3 pr-12">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <History className="size-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="font-heading text-sm">Query history</SheetTitle>
              <SheetDescription className="text-[11px]">
                {entries.length > 0
                  ? `${formatNumber(entries.length)} ${pluralize(entries.length, 'run')} · stored in this browser`
                  : 'Runs are stored in this browser'}
              </SheetDescription>
            </div>

            {entries.length > 0 ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Clear history"
                  >
                    <Trash2 />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear query history?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This removes all {formatNumber(entries.length)} saved runs. Your
                      notebook cells are not affected.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() => {
                        clear()
                        toast.success('History cleared')
                      }}
                    >
                      Clear history
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2 size-3 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search queries…"
                className="h-7 bg-background/50 pl-6.5 text-[11px]"
                aria-label="Search history"
              />
            </div>
            <div className="flex shrink-0 items-center gap-0.5 rounded-lg bg-muted p-0.5">
              {FILTERS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value)}
                  aria-pressed={filter === option.value}
                  className={cn(
                    'rounded-md px-2 py-1 text-[10px] font-medium transition-colors',
                    filter === option.value
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <History className="mb-2 size-6 text-muted-foreground/40" />
              <p className="text-xs font-medium">
                {entries.length === 0 ? 'No queries yet' : 'No matching queries'}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {entries.length === 0
                  ? 'Run a cell and it will show up here.'
                  : 'Try a different search or filter.'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border/40">
              {filtered.map((entry) => (
                <li key={entry.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => openInNotebook(entry.sql)}
                    className="block w-full py-2.5 pr-12 pl-4 text-left transition-colors hover:bg-muted/30"
                    title="Open in a new cell"
                  >
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[10px] text-muted-foreground">
                      {entry.status === 'success' ? (
                        <CircleCheck className="size-3 text-success" />
                      ) : (
                        <CircleAlert className="size-3 text-destructive" />
                      )}
                      <span
                        title={`${new Date(entry.timestamp).toLocaleString()} · ${formatClock(
                          entry.timestamp,
                        )}`}
                      >
                        {relativeTime(entry.timestamp)}
                      </span>
                      <span className="text-muted-foreground/30">·</span>
                      <span className="font-mono">{formatDuration(entry.durationMs)}</span>
                      {entry.status === 'success' ? (
                        <>
                          <span className="text-muted-foreground/30">·</span>
                          <span className="font-mono">
                            {formatNumber(entry.rowCount)} {pluralize(entry.rowCount, 'row')}
                          </span>
                        </>
                      ) : null}
                    </div>

                    <pre className="mt-1.5 line-clamp-3 font-mono text-[10.5px] leading-relaxed break-words whitespace-pre-wrap text-foreground/80">
                      {entry.sql.trim()}
                    </pre>

                    {entry.error ? (
                      <p
                        className="mt-1.5 line-clamp-2 rounded-md border border-destructive/20 bg-destructive/5 px-2 py-1 text-[10px] leading-relaxed text-destructive/90"
                        title={entry.error}
                      >
                        {entry.error}
                      </p>
                    ) : null}
                  </button>

                  <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 max-sm:opacity-60">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon-xs"
                          onClick={() => copyEntry(entry.sql)}
                          className="bg-background/80 backdrop-blur-sm"
                          aria-label="Copy query"
                        >
                          <Copy className="size-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy query</TooltipContent>
                    </Tooltip>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
