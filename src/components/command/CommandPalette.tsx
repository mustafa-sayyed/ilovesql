import {
  AlignLeft,
  BookOpen,
  Code2,
  Database,
  History,
  Play,
  RefreshCw,
  Settings,
  SunMoon,
  Trash,
  Type,
} from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { addCellAndFocus, runAllCells } from '@/lib/notebookActions'
import { formatSqlQuery, SAMPLE_QUERIES } from '@/lib/sql'
import { useTheme } from '@/lib/theme'
import { toast } from 'sonner'
import { useDbStore } from '@/store/db'
import { useNotebookStore } from '@/store/notebook'
import { useSettingsStore } from '@/store/settings'

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent)

export function CommandPalette({
  open,
  onOpenChange,
  onOpenHistory,
  onOpenNotebooks,
  onOpenSettings,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenHistory: () => void
  onOpenNotebooks: () => void
  onOpenSettings: () => void
}) {
  const { resolvedTheme, setTheme } = useTheme()
  const markdownEnabled = useSettingsStore((state) => state.markdownEnabled)

  const run = (action: () => void) => {
    onOpenChange(false)
    window.setTimeout(action, 320)
  }

  const formatActiveCell = () => {
    const state = useNotebookStore.getState()
    const active = state.cells.find((cell) => cell.id === state.activeCellId)

    if (!active || active.type !== 'sql' || !active.source.trim()) {
      toast.info('Select a SQL cell to format')
      return
    }

    const formatted = formatSqlQuery(active.source)
    if (formatted === active.source) {
      toast.info('Query is already formatted')
      return
    }

    state.updateCell(active.id, { source: formatted })
    toast.success('SQL formatted')
  }

  const addSample = (sql: string) => {
    const state = useNotebookStore.getState()
    addCellAndFocus('sql', state.activeCellId, sql)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command palette"
      description="Run actions, insert cells, and load sample queries."
    >
      <CommandInput placeholder="Type a command or search sample queries…" autoFocus />
      <CommandList>
        <CommandEmpty>No commands found.</CommandEmpty>

        <CommandGroup heading="Notebook">
          <CommandItem onSelect={() => run(() => void runAllCells())}>
            <Play />
            Run all cells
            <CommandShortcut>{IS_MAC ? '⌘ ⇧ ↵' : 'Ctrl Shift Enter'}</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(() => addCellAndFocus('sql'))}>
            <Code2 />
            New SQL cell
          </CommandItem>
          {markdownEnabled ? (
            <CommandItem onSelect={() => run(() => addCellAndFocus('markdown'))}>
              <Type />
              New markdown cell
            </CommandItem>
          ) : null}
          <CommandItem onSelect={() => run(onOpenNotebooks)}>
            <BookOpen />
            Open all notebooks
          </CommandItem>
          <CommandItem onSelect={() => run(onOpenSettings)}>
            <Settings />
            Open settings
          </CommandItem>
          <CommandItem onSelect={() => run(formatActiveCell)}>
            <AlignLeft />
            Format active SQL cell
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => {
                useNotebookStore.getState().clearRuns()
                toast.success('Outputs cleared')
              })
            }
          >
            <Trash />
            Clear all outputs
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Database">
          <CommandItem
            onSelect={() =>
              run(() => {
                void useDbStore
                  .getState()
                  .refreshSchema()
                  .then(() => toast.success('Schema refreshed'))
              })
            }
          >
            <RefreshCw />
            Refresh schema
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => {
                onOpenHistory()
              })
            }
          >
            <History />
            Open query history
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Appearance">
          <CommandItem
            onSelect={() =>
              run(() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'))
            }
          >
            <SunMoon />
            Toggle theme
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Sample queries">
          {SAMPLE_QUERIES.map((sample) => (
            <CommandItem
              key={sample.title}
              value={`${sample.title} ${sample.description}`}
              onSelect={() => run(() => addSample(sample.sql))}
            >
              <Database />
              <div className="flex min-w-0 flex-col">
                <span className="text-[12px]">{sample.title}</span>
                <span className="truncate text-[10px] text-muted-foreground">
                  {sample.description}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
