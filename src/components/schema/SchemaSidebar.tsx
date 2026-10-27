import {
  ArrowUpRight,
  ChevronRight,
  Database,
  Eye,
  KeyRound,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Search,
  Table2,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { focusEditor, insertIntoEditor } from '@/lib/editorRegistry'
import { formatBytes, formatNumber, qualifiedTableName } from '@/lib/format'
import { addCellAndFocus } from '@/lib/notebookActions'
import { cn } from '@/lib/utils'
import { useDbStore } from '@/store/db'
import { useNotebookStore } from '@/store/notebook'
import type { SchemaColumn, SchemaTable } from '@/types'

const TYPE_ALIASES: Record<string, string> = {
  'character varying': 'varchar',
  'character': 'char',
  'timestamp without time zone': 'timestamp',
  'timestamp with time zone': 'timestamptz',
  'time without time zone': 'time',
  'time with time zone': 'timetz',
  'double precision': 'float8',
  real: 'float4',
  integer: 'int4',
  bigint: 'int8',
  smallint: 'int2',
  boolean: 'bool',
  'user-defined': 'enum',
}

function shortType(type: string): string {
  const alias = TYPE_ALIASES[type.toLowerCase()]
  if (alias) return alias
  return type.length > 13 ? `${type.slice(0, 12)}…` : type
}

function compactCount(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

function ColumnsList({ table }: { table: SchemaTable }) {
  const activeCellId = useNotebookStore((state) => state.activeCellId)

  const insertColumn = (column: SchemaColumn) => {
    if (!activeCellId || !insertIntoEditor(activeCellId, column.name)) {
      toast.info('Focus a SQL cell to insert a column')
      return
    }
    focusEditor(activeCellId)
  }

  return (
    <div className="mb-1 ml-3.5 border-l border-border/50 pl-2">
      {table.columns.map((column) => (
        <button
          key={column.name}
          type="button"
          onClick={() => insertColumn(column)}
          className="flex w-full items-center gap-1.5 rounded px-1 py-[3px] text-left transition-colors hover:bg-accent/60"
          title={`${column.name} · ${column.dataType}${column.nullable ? '' : ' NOT NULL'}${
            column.default ? ` default ${column.default}` : ''
          }`}
        >
          {column.isPrimaryKey ? (
            <KeyRound className="size-2.5 shrink-0 text-warning" />
          ) : (
            <span className="flex w-2.5 shrink-0 justify-center text-muted-foreground/35">
              •
            </span>
          )}
          <span className="truncate font-mono text-[10.5px] text-foreground/80">
            {column.name}
          </span>
          <span className="ml-auto shrink-0 font-mono text-[9px] text-muted-foreground/50">
            {shortType(column.dataType)}
          </span>
        </button>
      ))}
    </div>
  )
}

function SchemaContent({
  onNavigate,
  onCollapse,
}: {
  onNavigate?: () => void
  onCollapse?: () => void
}) {
  const schema = useDbStore((state) => state.schema)
  const status = useDbStore((state) => state.status)
  const error = useDbStore((state) => state.error)
  const schemaLoading = useDbStore((state) => state.schemaLoading)
  const refreshSchema = useDbStore((state) => state.refreshSchema)
  const init = useDbStore((state) => state.init)

  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const filteredTables = useMemo(() => {
    const tables = schema?.tables ?? []
    const needle = search.trim().toLowerCase()
    if (!needle) return tables

    return tables.filter(
      (table) =>
        table.name.toLowerCase().includes(needle) ||
        table.schema.toLowerCase().includes(needle) ||
        table.columns.some((column) => column.name.toLowerCase().includes(needle)),
    )
  }, [schema, search])

  const searching = search.trim().length > 0

  const groups = useMemo(() => {
    const map = new Map<string, SchemaTable[]>()
    for (const table of filteredTables) {
      const list = map.get(table.schema) ?? []
      list.push(table)
      map.set(table.schema, list)
    }
    return [...map.entries()]
  }, [filteredTables])

  const schemaSummary = useMemo(() => {
    const names = [...new Set((schema?.tables ?? []).map((table) => table.schema))]
    if (names.length === 0) return 'public'
    return names.length === 1 ? names[0] : `${names.length} schemas`
  }, [schema])

  const toggleTable = (key: string) => {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const insertQuery = (table: SchemaTable) => {
    const afterId = useNotebookStore.getState().activeCellId
    const sql = `SELECT *\nFROM ${qualifiedTableName(table.schema, table.name)}\nLIMIT 100;`
    addCellAndFocus('sql', afterId, sql, onNavigate ? 320 : 70)
    onNavigate?.()
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2.5">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Database className="size-3.5" />
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-[12px] font-medium">Schema</div>
        </div>

        {onCollapse ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onCollapse}
                aria-label="Hide sidebar"
              >
                <PanelLeftClose />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Hide sidebar</TooltipContent>
          </Tooltip>
        ) : null}
      </div>

      <div className="px-2.5 pt-2.5 text-[10px] text-muted-foreground">
        <Tooltip>
					<TooltipTrigger asChild>
						<Button
							size="sm"
              variant="outline"
							onClick={() => void refreshSchema()}
							disabled={status !== "ready" || schemaLoading}
							aria-label="Refresh schema"
              className="flex item-center gap-2 text-[11px]"
						>
							<RefreshCw className={cn(schemaLoading && "animate-spin")} />
							Refresh Schema
						</Button>
					</TooltipTrigger>
					<TooltipContent>Refresh schema</TooltipContent>
				</Tooltip>
				<div className="relative flex items-center mt-2.5">
					<Search className="pointer-events-none absolute text-muted-foreground/60 top-1/2 left-2 size-3 -translate-y-1/2 " />
					<Input
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder="Search tables & columns"
						className="h-7 bg-background/50 pl-6 text-[11px] placeholder:text-[11px]"
						aria-label="Search schema"
					/>
				</div>
			</div>

      <div className="min-h-0 flex-1 overflow-y-auto px-1.5 py-2">
        {status === 'error' ? (
          <div className="mx-1 space-y-2 rounded-md border border-destructive/30 bg-destructive/5 p-2.5">
            <p className="text-[11px] leading-relaxed text-destructive">
              {error ?? 'Could not open the database.'}
            </p>
            <Button variant="outline" size="sm" className="h-7 w-full" onClick={() => void init()}>
              Try again
            </Button>
          </div>
        ) : !schema ? (
          <div className="space-y-2 px-1 pt-1">
            {Array.from({ length: 7 }, (_, index) => (
              <div
                key={index}
                className="h-5 animate-pulse rounded bg-muted"
                style={{ width: `${52 + ((index * 13) % 38)}%` }}
              />
            ))}
          </div>
        ) : filteredTables.length === 0 ? (
          <p className="px-2 py-6 text-center text-[11px] text-muted-foreground">
            No tables match “{search}”.
          </p>
        ) : (
          <div className="space-y-3">
            {groups.map(([groupName, tables]) => (
              <div key={groupName}>
                <div className="px-1.5 pb-1 font-mono text-[9px] font-medium tracking-wider text-muted-foreground/60 uppercase">
                  {groupName}
                </div>
                <div className="space-y-px">
                  {tables.map((table) => {
                    const key = `${table.schema}.${table.name}`
                    const open = searching || expanded.has(key)
                    return (
                      <div key={key}>
                        <div className="group flex items-center rounded-md transition-colors hover:bg-accent/60">
                          <button
                            type="button"
                            onClick={() => toggleTable(key)}
                            className="flex min-w-0 flex-1 items-center gap-1.5 px-1.5 py-1 text-left"
                            aria-expanded={open}
                          >
                            <ChevronRight
                              className={cn(
                                'size-3 shrink-0 text-muted-foreground/50 transition-transform',
                                open && 'rotate-90',
                              )}
                            />
                            {table.kind === 'view' ? (
                              <Eye className="size-3.5 shrink-0 text-muted-foreground" />
                            ) : (
                              <Table2 className="size-3.5 shrink-0 text-muted-foreground" />
                            )}
                            <span className="min-w-0 flex-1 truncate text-[11.5px]">
                              {table.name}
                            </span>
                            {table.rowCount !== null ? (
                              <span className="shrink-0 font-mono text-[9px] text-muted-foreground/45">
                                {compactCount(table.rowCount)}
                              </span>
                            ) : null}
                          </button>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                className="mr-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                                onClick={() => insertQuery(table)}
                                aria-label={`Query ${table.name}`}
                              >
                                <ArrowUpRight className="size-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Insert SELECT for {table.name}</TooltipContent>
                          </Tooltip>
                        </div>

                        {open ? <ColumnsList table={table} /> : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto border-t border-border/60 p-2.5">
        <div className="mb-1.5 flex items-center justify-between font-mono text-[9.5px] text-muted-foreground/70">
          <span>{schema ? formatNumber(schema.tables.length) : '—'} tables</span>
          <span>{schema ? formatBytes(schema.databaseSize) : '—'}</span>
        </div>
      </div>
    </div>
  )
}

export function SchemaSidebar({
  open,
  onOpenChange,
  collapsed = false,
  onToggleCollapsed,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  collapsed?: boolean
  onToggleCollapsed: () => void
}) {
  return (
    <>
      <aside
        className={cn(
          'hidden shrink-0 border-r border-border/60 bg-sidebar lg:flex lg:flex-col',
          collapsed ? 'w-10' : 'w-64',
        )}
      >
        {collapsed ? (
          <div className="flex flex-col items-center py-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onToggleCollapsed}
                  aria-label="Show sidebar"
                >
                  <PanelLeftOpen />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Show sidebar</TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <SchemaContent onCollapse={onToggleCollapsed} />
        )}
      </aside>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-72 gap-0 bg-sidebar p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Database schema</SheetTitle>
            <SheetDescription>Browse tables, columns, and views.</SheetDescription>
          </SheetHeader>
          <SchemaContent onNavigate={() => onOpenChange(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
