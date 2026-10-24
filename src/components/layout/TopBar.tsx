import {
  ArrowLeft,
  BookOpen,
  FilePlus2,
  History,
  MoreHorizontal,
  PanelLeft,
  Play,
  Search,
  Settings,
  SunMoon,
  Trash,
} from 'lucide-react'
import { useState } from 'react'
import { BrandMark } from '@/components/brand/BrandMark'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Kbd } from '@/components/ui/kbd'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { focusEditor } from '@/lib/editorRegistry'
import { runAllCells } from '@/lib/notebookActions'
import { useTheme } from '@/lib/theme'
import { useHistoryStore } from '@/store/history'
import { getNotebookCount, useNotebookStore } from '@/store/notebook'
import { toast } from 'sonner'

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent)
const MOD_LABEL = IS_MAC ? '⌘' : 'Ctrl'

interface TopBarProps {
  view: 'notebook' | 'notebooks' | 'settings'
  onBackToNotebook: () => void
  onOpenSchema: () => void
  onOpenHistory: () => void
  onOpenCommand: () => void
  onOpenNotebooks: () => void
  onOpenSettings: () => void
  onNotebookCreated: (notebookId: string) => void
}

export function TopBar({
  view,
  onBackToNotebook,
  onOpenSchema,
  onOpenHistory,
  onOpenCommand,
  onOpenNotebooks,
  onOpenSettings,
  onNotebookCreated,
}: TopBarProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [newNotebookOpen, setNewNotebookOpen] = useState(false)
  const title = useNotebookStore((state) => state.title)
  const isRunningAll = useNotebookStore((state) => state.isRunningAll)
  const hasRuns = useNotebookStore((state) => Object.keys(state.runs).length > 0)
  const clearRuns = useNotebookStore((state) => state.clearRuns)
  const createNotebook = useNotebookStore((state) => state.createNotebook)
  const notebookCount = useNotebookStore(getNotebookCount)
  const historyCount = useHistoryStore((state) => state.entries.length)

  const createNewNotebook = () => {
    const notebookId = createNotebook()
    setNewNotebookOpen(false)
    onNotebookCreated(notebookId)
    document.getElementById('notebook-scroll')?.scrollTo({ top: 0 })
    window.setTimeout(() => {
      const id = useNotebookStore.getState().activeCellId
      if (id) focusEditor(id)
    }, 320)
    toast.success('New notebook ready')
  }

  if (view !== 'notebook') {
    const pageTitle = view === 'notebooks' ? 'All notebooks' : 'Settings'

    return (
      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-border/60 bg-background/80 px-2 backdrop-blur sm:px-3">
        <a className="flex items-center gap-2 cursor-pointer" href="/notebooks">
          <BrandMark />
          <div className="leading-none">
            <div className="font-heading text-[13px] font-semibold tracking-tight">ilovesql</div>
            <div className="mt-0.5 hidden text-[9px] text-muted-foreground/70 sm:block">
              local SQL notebook
            </div>
          </div>
        </a>

        <div className="hidden min-w-0 items-center gap-1.5 pl-2 sm:flex">
          <span className="text-muted-foreground/25">/</span>
          <span className="truncate text-[11px] text-muted-foreground">{pageTitle}</span>
        </div>

        <div className="ml-auto flex items-center gap-1">
          {view === 'settings' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToNotebook}
              className="gap-1.5"
              aria-label="Back to notebook"
            >
              <ArrowLeft className="size-3.5" />
              <span className="hidden sm:inline">Back to notebook</span>
              <span className="sm:hidden">Notebook</span>
            </Button>
          ) : null}

          {view === 'notebooks' ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onOpenSettings}
                  aria-label="Settings"
                >
                  <Settings />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
          ) : null}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
              >
                <SunMoon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle theme</TooltipContent>
          </Tooltip>
        </div>
      </header>
    )
  }

  return (
    <header className="flex h-11 shrink-0 items-center gap-2 border-b border-border/60 bg-background/80 px-2 backdrop-blur sm:px-3">
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={onOpenSchema}
        aria-label="Open schema"
      >
        <PanelLeft />
      </Button>

      <a className="flex items-center gap-2 cursor-pointer" href="/notebooks">
        <BrandMark />
        <div className="leading-none">
          <div className="font-heading text-[13px] font-semibold tracking-tight">ilovesql</div>
          <div className="mt-0.5 hidden text-[9px] text-muted-foreground/70 sm:block">
            local SQL notebook
          </div>
        </div>
      </a>

      <div className="hidden min-w-0 items-center gap-1.5 pl-2 md:flex">
        <span className="text-muted-foreground/25">/</span>
        <span className="max-w-56 truncate text-[11px] text-muted-foreground" title={title}>
          {title || 'Untitled notebook'}
        </span>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setNewNotebookOpen(true)}
            aria-label="New notebook"
          >
            <FilePlus2 />
          </Button>
        </TooltipTrigger>
        <TooltipContent>New notebook</TooltipContent>
      </Tooltip>

      <div className="relative">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onOpenNotebooks}
              aria-label="All notebooks"
            >
              <BookOpen />
            </Button>
          </TooltipTrigger>
          <TooltipContent>All notebooks</TooltipContent>
        </Tooltip>
        <span className="pointer-events-none absolute -top-0.5 -right-0.5 flex h-3 min-w-3 items-center justify-center rounded-full bg-primary px-0.5 font-mono text-[7.5px] leading-none text-primary-foreground">
          {notebookCount > 9 ? '9+' : notebookCount}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => void runAllCells()}
          disabled={isRunningAll}
          className="gap-1.5"
        >
          {isRunningAll ? <Spinner className="size-3" /> : <Play className="size-3 fill-current" />}
          <span className="hidden sm:inline">Run all</span>
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearRuns()}
              disabled={!hasRuns}
              className="gap-1.5"
              aria-label="Clear all outputs"
            >
              <Trash className="size-3" />
              <span className="hidden sm:inline">Clear outputs</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear all outputs</TooltipContent>
        </Tooltip>

        <button
          type="button"
          onClick={onOpenCommand}
          className="hidden h-7 w-52 items-center gap-2 rounded-lg border border-border/70 bg-muted/30 px-2 text-[11px] text-muted-foreground transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none md:flex"
        >
          <Search className="size-3" />
          <span className="flex-1 text-left">Search or run a command</span>
          <Kbd className="h-4 min-w-4 px-1 text-[9px]">{MOD_LABEL} K</Kbd>
        </button>

        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={onOpenCommand}
          aria-label="Open command palette"
        >
          <Search />
        </Button>

        <div className="relative">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={onOpenHistory} aria-label="History">
                <History />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Query history</TooltipContent>
          </Tooltip>
          {historyCount > 0 ? (
            <span className="pointer-events-none absolute top-0.5 -right-0 flex h-3 min-w-3 items-center justify-center rounded-full bg-primary px-0.5 font-mono text-[7.5px] leading-none text-primary-foreground">
              {historyCount > 9 ? '9+' : historyCount}
            </span>
          ) : null}
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              <SunMoon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle theme</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="More actions">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onOpenSettings}>
              <Settings />
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={newNotebookOpen} onOpenChange={setNewNotebookOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start a new notebook?</AlertDialogTitle>
            <AlertDialogDescription>
              Your current notebook will stay available in All notebooks. Query history and the
              database stay exactly as they are.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={createNewNotebook}>New notebook</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  )
}
