import { CircleAlert, CircleCheck, Copy, LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { copyToClipboard } from '@/lib/export'
import { formatDuration, formatNumber } from '@/lib/format'
import type { CellRun, QueryErrorInfo, QueryResultSet } from '@/types'
import { ResultTable } from './ResultTable'

function RunningPanel() {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/10 px-3 py-3">
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <LoaderCircle className="size-3.5 animate-spin text-primary" />
        Running query…
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-2.5 w-[38%] animate-pulse rounded bg-muted" />
        <div className="h-2.5 w-[72%] animate-pulse rounded bg-muted/70" />
        <div className="h-2.5 w-[55%] animate-pulse rounded bg-muted/50" />
      </div>
    </div>
  )
}

function ErrorPanel({ error, durationMs }: { error: QueryErrorInfo; durationMs?: number }) {
  const copyError = () => {
    const text = [
      error.message,
      error.code ? `SQLSTATE: ${error.code}` : null,
      error.detail ? `Detail: ${error.detail}` : null,
      error.hint ? `Hint: ${error.hint}` : null,
    ]
      .filter(Boolean)
      .join('\n\n')

    void copyToClipboard(text).then(() => toast.success('Error copied'))
  }

  return (
    <div className="rounded-lg border border-destructive/25 bg-destructive/[0.04] px-3 py-2.5">
      <div className="flex items-start gap-2">
        <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-mono text-[11.5px] leading-relaxed break-words text-destructive">
            {error.message}
          </p>

          <div className="flex flex-wrap items-center gap-1.5">
            {error.code ? (
              <Badge variant="outline" className="font-mono text-[10px]">
                {error.code}
              </Badge>
            ) : null}
            {error.position ? (
              <Badge variant="outline" className="font-mono text-[10px]">
                position {error.position}
              </Badge>
            ) : null}
            {durationMs !== undefined ? (
              <Badge variant="outline" className="font-mono text-[10px]">
                {formatDuration(durationMs)}
              </Badge>
            ) : null}
          </div>

          {error.detail ? (
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground/70">Detail: </span>
              {error.detail}
            </p>
          ) : null}
          {error.hint ? (
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground/70">Hint: </span>
              {error.hint}
            </p>
          ) : null}
        </div>

        <Button variant="ghost" size="icon-sm" onClick={copyError} aria-label="Copy error">
          <Copy />
        </Button>
      </div>
    </div>
  )
}

function CommandStrip({ result }: { result: QueryResultSet }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-success/[0.04] px-3 py-2.5">
      <CircleCheck className="size-4 shrink-0 text-success" />
      <span className="text-[11.5px] text-muted-foreground">
        <span className="font-mono font-medium text-foreground/80">
          {result.command ?? 'Statement'}
        </span>{' '}
        executed successfully
      </span>
      {typeof result.affectedRows === 'number' && result.affectedRows > 0 ? (
        <Badge variant="secondary" className="ml-auto font-mono text-[10px]">
          {formatNumber(result.affectedRows)} rows affected
        </Badge>
      ) : null}
    </div>
  )
}

function ResultBody({
  result,
  runKey,
  index,
}: {
  result: QueryResultSet
  runKey: string
  index: number
}) {
  if (result.fields.length === 0 && result.rows.length === 0) {
    return <CommandStrip result={result} />
  }

  return <ResultTable key={`${runKey}-${index}`} result={result} />
}

export function ResultPanel({ run }: { run: CellRun }) {
  if (run.status === 'idle') return null
  if (run.status === 'running') return <RunningPanel />

  if (run.status === 'error') {
    return run.error ? (
      <ErrorPanel error={run.error} durationMs={run.durationMs} />
    ) : (
      <div className="rounded-lg border border-destructive/25 bg-destructive/[0.04] px-3 py-2.5 text-[11.5px] text-destructive">
        Query failed.
      </div>
    )
  }

  if (run.results.length === 0) {
    return (
      <div className="rounded-lg border border-border/60 bg-muted/10 px-3 py-2.5 text-[11.5px] text-muted-foreground">
        No result sets returned.
      </div>
    )
  }

  const runKey = String(run.finishedAt ?? run.startedAt ?? 0)

  if (run.results.length === 1) {
    return <ResultBody result={run.results[0]} runKey={runKey} index={0} />
  }

  return (
    <Tabs defaultValue="0" key={runKey} className="gap-1.5">
      <TabsList variant="line" className="h-7 justify-start border-b border-border/60 px-0">
        {run.results.map((result, index) => (
          <TabsTrigger
            key={index}
            value={String(index)}
            className="h-7 flex-none rounded-none px-2.5 font-mono text-[10.5px]"
          >
            {result.command ?? `Result ${index + 1}`}
            <span className="text-[9.5px] text-muted-foreground">
              {formatNumber(result.rows.length)}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>

      {run.results.map((result, index) => (
        <TabsContent key={index} value={String(index)}>
          <ResultBody result={result} runKey={runKey} index={index} />
        </TabsContent>
      ))}
    </Tabs>
  )
}
