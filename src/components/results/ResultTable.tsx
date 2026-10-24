import { useVirtualizer } from '@tanstack/react-virtual'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronDown,
  Columns3,
  Copy,
  Download,
  FileJson,
  FileSpreadsheet,
} from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  copyToClipboard,
  downloadText,
  exportTimestamp,
  resultToCsv,
  resultToJson,
  resultToTsv,
} from '@/lib/export'
import {
  estimateColumnWidth,
  formatNumber,
  formatValue,
  isNumericType,
  parseNumeric,
  valueKind,
} from '@/lib/format'
import { cn } from '@/lib/utils'
import type { QueryField, QueryResultSet } from '@/types'

const ROW_HEIGHT = 34
const ROW_NUMBER_WIDTH = 52

interface ResultTableProps {
  result: QueryResultSet
}

interface SortState {
  key: string
  direction: 'asc' | 'desc'
}

function deriveFields(result: QueryResultSet): QueryField[] {
  if (result.fields.length > 0) return result.fields

  const keys = new Set<string>()
  for (const row of result.rows) {
    for (const key of Object.keys(row)) keys.add(key)
  }

  return [...keys].map((name) => ({ name, dataTypeID: 25 }))
}

function compareValues(
  left: unknown,
  right: unknown,
  dataTypeID: number | undefined,
  direction: 1 | -1,
): number {
  const leftNull = left === null || left === undefined
  const rightNull = right === null || right === undefined
  if (leftNull && rightNull) return 0
  if (leftNull) return 1
  if (rightNull) return -1

  const numbers = isNumericType(dataTypeID) || typeof left === 'number' || typeof left === 'bigint'
  const leftNumber = numbers ? parseNumeric(left) : null
  const rightNumber = numbers ? parseNumeric(right) : null
  if (leftNumber !== null && rightNumber !== null) {
    if (leftNumber !== rightNumber) return (leftNumber - rightNumber) * direction
    return 0
  }

  if (typeof left === 'boolean' && typeof right === 'boolean') {
    return (Number(left) - Number(right)) * direction
  }

  if (left instanceof Date || right instanceof Date) {
    return (new Date(left as string).getTime() - new Date(right as string).getTime()) * direction
  }

  const text = String(left)
  const other = String(right)

  if (dataTypeID === 2950 || text.length === other.length) {
    return text.localeCompare(other) * direction
  }

  return text.localeCompare(other, undefined, { numeric: true }) * direction
}

function prettyValue(value: unknown, dataTypeID?: number): string {
  if (value instanceof Date) return formatValue(value, dataTypeID)
  if (typeof value === 'string') {
    try {
      return JSON.stringify(JSON.parse(value), null, 2)
    } catch {
      return value
    }
  }
  if (typeof value === 'object' && value !== null) {
    try {
      return JSON.stringify(
        value,
        (_key, item) => (typeof item === 'bigint' ? item.toString() : item),
        2,
      )
    } catch {
      return formatValue(value, dataTypeID)
    }
  }
  return formatValue(value, dataTypeID)
}

function ValueCell({
  value,
  field,
  width,
}: {
  value: unknown
  field: QueryField
  width: number
}) {
  const kind = valueKind(value, field.dataTypeID)
  const text = formatValue(value, field.dataTypeID)
  const isLong = text.length > 56 || kind === 'json' || text.includes('\n')
  const numeric = kind === 'number'

  const content =
    kind === 'null' ? (
      <span className="text-[11px] italic text-muted-foreground/60">NULL</span>
    ) : kind === 'boolean' ? (
      <span
        className={cn(
          'rounded px-1.5 py-0.5 font-mono text-[10px]',
          value ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive',
        )}
      >
        {text}
      </span>
    ) : (
      <span className={cn('truncate', numeric && 'tabular-nums')}>{text}</span>
    )

  return (
    <div
      style={{ width }}
      className={cn(
        'flex shrink-0 items-center overflow-hidden border-l border-border/40 px-2.5 font-mono text-[11.5px]',
        numeric && 'justify-end',
      )}
    >
      {isLong && kind !== 'null' ? (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="max-w-full cursor-pointer truncate text-left hover:text-primary"
              title="Click to inspect value"
            >
              {content}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[min(36rem,85vw)] gap-0 p-0">
            <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2">
              <span className="truncate font-mono text-[11px] text-muted-foreground">
                {field.name}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  void copyToClipboard(prettyValue(value, field.dataTypeID)).then(() =>
                    toast.success('Value copied'),
                  )
                }}
                aria-label="Copy value"
              >
                <Copy />
              </Button>
            </div>
            <pre className="max-h-72 overflow-auto p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
              {prettyValue(value, field.dataTypeID)}
            </pre>
          </PopoverContent>
        </Popover>
      ) : (
        <span className="truncate" title={text.length > 40 ? text : undefined}>
          {content}
        </span>
      )}
    </div>
  )
}

export function ResultTable({ result }: ResultTableProps) {
  const columns = useMemo(() => deriveFields(result), [result])
  const scrollRef = useRef<HTMLDivElement>(null)
  const [sort, setSort] = useState<SortState | null>(null)
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const [widths, setWidths] = useState<Record<string, number>>(() => {
    const next: Record<string, number> = {}
    for (const field of deriveFields(result)) {
      next[field.name] = estimateColumnWidth(
        field.name,
        result.rows.map((row) => row[field.name]),
      )
    }
    return next
  })

  const visibleColumns = columns.filter((column) => !hidden.has(column.name))

  const sortedRows = useMemo(() => {
    if (!sort) return result.rows
    const field = columns.find((column) => column.name === sort.key)
    const direction = sort.direction === 'asc' ? 1 : -1
    return [...result.rows].sort((left, right) =>
      compareValues(left[sort.key], right[sort.key], field?.dataTypeID, direction),
    )
  }, [columns, result.rows, sort])

  const totalWidth =
    ROW_NUMBER_WIDTH +
    visibleColumns.reduce((total, column) => total + (widths[column.name] ?? 160), 0)

  const rowVirtualizer = useVirtualizer({
    count: sortedRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 14,
  })

  const exportResult: QueryResultSet = {
    ...result,
    fields: visibleColumns,
    rows: sortedRows.map((row) =>
      Object.fromEntries(visibleColumns.map((column) => [column.name, row[column.name]])),
    ),
  }

  const toggleSort = (key: string) => {
    setSort((current) => {
      if (!current || current.key !== key) return { key, direction: 'asc' }
      if (current.direction === 'asc') return { key, direction: 'desc' }
      return null
    })
  }

  const startResize = (event: React.PointerEvent, key: string) => {
    event.preventDefault()
    event.stopPropagation()

    const startX = event.clientX
    const startWidth = widths[key] ?? 160

    const onMove = (moveEvent: PointerEvent) => {
      const nextWidth = Math.min(620, Math.max(88, startWidth + moveEvent.clientX - startX))
      setWidths((current) => ({ ...current, [key]: nextWidth }))
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const copyAsTsv = () => {
    void copyToClipboard(resultToTsv(exportResult)).then(() =>
      toast.success('Copied result as TSV'),
    )
  }

  const exportCsv = () => {
    downloadText(
      `query-result-${exportTimestamp()}.csv`,
      resultToCsv(exportResult),
      'text/csv',
    )
    toast.success('CSV downloaded')
  }

  const exportJson = () => {
    downloadText(
      `query-result-${exportTimestamp()}.json`,
      resultToJson(exportResult),
      'application/json',
    )
    toast.success('JSON downloaded')
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border/70 bg-background/40">
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-muted/20 px-2.5 py-1.5">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span>{formatNumber(sortedRows.length)} rows</span>
          <span className="text-muted-foreground/40">·</span>
          <span>{visibleColumns.length} columns</span>
        </div>

        <div className="ml-auto flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={copyAsTsv} aria-label="Copy result">
                <Copy />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy as TSV</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 px-2 text-[11px]">
                <Columns3 className="size-3.5" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.name}
                  checked={!hidden.has(column.name)}
                  onSelect={(event) => event.preventDefault()}
                  onCheckedChange={(checked) => {
                    setHidden((current) => {
                      const next = new Set(current)
                      if (checked) next.delete(column.name)
                      else next.add(column.name)
                      return next
                    })
                  }}
                >
                  <span className="truncate font-mono text-[11px]">{column.name}</span>
                  {!hidden.has(column.name) ? <Check className="ml-auto size-3.5" /> : null}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 px-2 text-[11px]">
                <Download className="size-3.5" />
                Export
                <ChevronDown className="size-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={exportCsv}>
                <FileSpreadsheet />
                Download CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportJson}>
                <FileJson />
                Download JSON
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={copyAsTsv}>
                <Copy />
                Copy as TSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div style={{ width: totalWidth }} className="min-w-full">
          <div
            role="row"
            className="flex h-8 items-stretch border-b border-border/70 bg-muted/30"
          >
            <div
              role="columnheader"
              className="flex w-[52px] shrink-0 items-center justify-center border-r border-border/50 text-[10px] text-muted-foreground/70"
            >
              #
            </div>

            {visibleColumns.map((column) => {
              const active = sort?.key === column.name
              return (
                <div
                  key={column.name}
                  role="columnheader"
                  style={{ width: widths[column.name] ?? 160 }}
                  className="group relative flex shrink-0 items-center border-r border-border/40 px-2"
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(column.name)}
                    className="flex min-w-0 flex-1 items-center gap-1 text-left"
                    title={`Sort by ${column.name}`}
                  >
                    <span className="truncate font-mono text-[10.5px] font-medium tracking-tight text-foreground/80">
                      {column.name}
                    </span>
                    {active ? (
                      sort.direction === 'asc' ? (
                        <ArrowUp className="size-3 shrink-0 text-primary" />
                      ) : (
                        <ArrowDown className="size-3 shrink-0 text-primary" />
                      )
                    ) : (
                      <ArrowUpDown className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-30" />
                    )}
                  </button>

                  <div
                    role="separator"
                    aria-orientation="vertical"
                    onPointerDown={(event) => startResize(event, column.name)}
                    className="absolute -right-0.5 top-0 z-10 h-full w-1.5 cursor-col-resize touch-none hover:bg-primary/40"
                  />
                </div>
              )
            })}
          </div>

          {sortedRows.length === 0 ? (
            <div className="flex items-center justify-center px-4 py-12 text-center text-xs text-muted-foreground">
              <div className="flex flex-col items-center gap-1.5">
                <span className="font-mono text-sm">0 rows</span>
                <span>The query returned an empty result set.</span>
              </div>
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="max-h-[430px] overflow-x-hidden overflow-y-auto"
              role="rowgroup"
            >
              <div
                style={{
                  height: rowVirtualizer.getTotalSize(),
                  position: 'relative',
                  width: totalWidth,
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const row = sortedRows[virtualRow.index]
                  return (
                    <div
                      key={virtualRow.key}
                      role="row"
                      className={cn(
                        'absolute left-0 top-0 flex w-full border-b border-border/30 hover:bg-muted/30',
                        virtualRow.index % 2 === 1 && 'bg-muted/[0.08]',
                      )}
                      style={{
                        transform: `translateY(${virtualRow.start}px)`,
                        height: virtualRow.size,
                        width: totalWidth,
                      }}
                    >
                      <div
                        role="cell"
                        className="flex w-[52px] shrink-0 items-center justify-center border-r border-border/30 font-mono text-[10px] text-muted-foreground/50"
                      >
                        {virtualRow.index + 1}
                      </div>
                      {visibleColumns.map((column) => (
                        <ValueCell
                          key={column.name}
                          value={row[column.name]}
                          field={column}
                          width={widths[column.name] ?? 160}
                        />
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {result.rows.length > 500 && (
        <div className="border-t border-border/60 bg-muted/20 px-3 py-1.5 text-[10px] text-muted-foreground">
          Showing a virtualized preview of {formatNumber(result.rows.length)} rows. Exports
          include the full result set.
        </div>
      )}
    </div>
  )
}
