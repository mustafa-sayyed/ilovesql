import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useMatch,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { toast } from 'sonner'
import { BootScreen } from '@/components/boot/BootScreen'
import { CommandPalette } from '@/components/command/CommandPalette'
import { HistorySheet } from '@/components/history/HistorySheet'
import { LandingPage } from '@/components/landing/LandingPage'
import { StatusBar } from '@/components/layout/StatusBar'
import { TopBar } from '@/components/layout/TopBar'
import { Notebook } from '@/components/notebook/Notebook'
import { NotebooksPage } from '@/components/notebooks/NotebooksPage'
import { SchemaSidebar } from '@/components/schema/SchemaSidebar'
import { SettingsPage } from '@/components/settings/SettingsPage'
import { Spinner } from '@/components/ui/spinner'
import { runAllCells } from '@/lib/notebookActions'
import { useDbStore } from '@/store/db'
import { useNotebookStore } from '@/store/notebook'

const SIDEBAR_KEY = 'ilovesql-sidebar'

function readSidebarCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === 'hidden'
  } catch {
    return false
  }
}

function persistSidebarCollapsed(collapsed: boolean): void {
  try {
    localStorage.setItem(SIDEBAR_KEY, collapsed ? 'hidden' : 'shown')
  } catch {
    return
  }
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <main id="notebook-scroll" className="canvas-grid min-h-0 flex-1 overflow-y-auto">
      {children}
    </main>
  )
}

function NotebookRoute({
  schemaOpen,
  onSchemaOpenChange,
  sidebarCollapsed,
  onToggleSidebar,
}: {
  schemaOpen: boolean
  onSchemaOpenChange: (open: boolean) => void
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
}) {
  const { notebookId: routeNotebookId } = useParams<{ notebookId: string }>()
  const navigate = useNavigate()
  const activeNotebookId = useNotebookStore((state) => state.notebookId)
  const checkedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!routeNotebookId) {
      navigate('/notebooks', { replace: true })
      return
    }

    const state = useNotebookStore.getState()
    if (state.notebookId === routeNotebookId) return

    const savedNotebook = state.savedNotebooks.find(
      (notebook) => notebook.id === routeNotebookId,
    )

    if (!savedNotebook) {
      if (checkedRef.current !== routeNotebookId) {
        checkedRef.current = routeNotebookId
        toast.error('Notebook not found')
      }
      navigate('/notebooks', { replace: true })
      return
    }

    state.openNotebook(routeNotebookId)

    if (useNotebookStore.getState().notebookId !== routeNotebookId) {
      toast.error('That notebook could not be opened')
      navigate('/notebooks', { replace: true })
    }
  }, [navigate, routeNotebookId])

  if (!routeNotebookId || activeNotebookId !== routeNotebookId) {
    return (
      <main id="notebook-scroll" className="canvas-grid min-w-0 flex-1 overflow-y-auto">
        <div className="flex h-full items-center justify-center gap-2 text-[11px] text-muted-foreground">
          <Spinner className="size-3.5" />
          Opening notebook…
        </div>
      </main>
    )
  }

  return (
    <div className="flex min-h-0 flex-1">
      <SchemaSidebar
        open={schemaOpen}
        onOpenChange={onSchemaOpenChange}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={onToggleSidebar}
      />

      <main id="notebook-scroll" className="canvas-grid min-w-0 flex-1 overflow-y-auto">
        <Notebook />
      </main>
    </div>
  )
}

export default function App() {
  const status = useDbStore((state) => state.status)
  const init = useDbStore((state) => state.init)
  const currentNotebookId = useNotebookStore((state) => state.notebookId)
  const navigate = useNavigate()
  const location = useLocation()
  const isLandingPage = location.pathname === '/'
  const isNotebooksPage = Boolean(useMatch('/notebooks'))
  const isSettingsPage = Boolean(useMatch('/settings'))

  const [schemaOpen, setSchemaOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarCollapsed)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)

  const view = isNotebooksPage ? 'notebooks' : isSettingsPage ? 'settings' : 'notebook'

  const toggleSidebar = () => {
    const next = !sidebarCollapsed
    setSidebarCollapsed(next)
    persistSidebarCollapsed(next)
  }

  const openNotebookPage = () => {
    setSchemaOpen(false)
    setHistoryOpen(false)
    setCommandOpen(false)
    navigate(`/notebooks/${currentNotebookId}`)
  }

  const openNotebooksPage = () => {
    setSchemaOpen(false)
    setHistoryOpen(false)
    setCommandOpen(false)
    navigate('/notebooks')
  }

  const openSettingsPage = () => {
    setSchemaOpen(false)
    setHistoryOpen(false)
    setCommandOpen(false)
    navigate('/settings')
  }

  useEffect(() => {
    void init()
  }, [init])

  useEffect(() => {
    document.getElementById('notebook-scroll')?.scrollTo({ top: 0 })
  }, [location.pathname])

  useEffect(() => {
    if (isLandingPage) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing || event.defaultPrevented) return
      const mod = event.metaKey || event.ctrlKey
      if (!mod) return

      if (event.key.toLowerCase() === 'k' && !event.shiftKey && !event.altKey) {
        event.preventDefault()
        setSchemaOpen(false)
        setHistoryOpen(false)
        setCommandOpen((open) => !open)
        return
      }

      if (event.key === 'Enter' && event.shiftKey) {
        event.preventDefault()
        void runAllCells()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isLandingPage])

  if (isLandingPage) {
    return <LandingPage />
  }

  if (status !== 'ready') {
    return <BootScreen />
  }

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-background text-foreground">
      <TopBar
        view={view}
        onBackToNotebook={openNotebookPage}
        onOpenSchema={() => {
          setHistoryOpen(false)
          setCommandOpen(false)
          setSchemaOpen(true)
        }}
        onOpenHistory={() => {
          setSchemaOpen(false)
          setCommandOpen(false)
          setHistoryOpen(true)
        }}
        onOpenCommand={() => {
          setSchemaOpen(false)
          setHistoryOpen(false)
          setCommandOpen(true)
        }}
        onOpenNotebooks={openNotebooksPage}
        onOpenSettings={openSettingsPage}
        onNotebookCreated={(notebookId) => {
          setSchemaOpen(false)
          setHistoryOpen(false)
          setCommandOpen(false)
          navigate(`/notebooks/${notebookId}`)
        }}
      />

      <Routes>
        <Route
          path="/notebooks"
          element={
            <PageShell>
              <NotebooksPage />
            </PageShell>
          }
        />
        <Route
          path="/notebooks/:notebookId"
          element={
            <NotebookRoute
              schemaOpen={schemaOpen}
              onSchemaOpenChange={setSchemaOpen}
              sidebarCollapsed={sidebarCollapsed}
              onToggleSidebar={toggleSidebar}
            />
          }
        />
        <Route
          path="/settings"
          element={
            <PageShell>
              <SettingsPage />
            </PageShell>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <StatusBar view={view} />

      <HistorySheet open={historyOpen} onOpenChange={setHistoryOpen} />
      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onOpenHistory={() => {
          setSchemaOpen(false)
          setHistoryOpen(true)
        }}
        onOpenNotebooks={openNotebooksPage}
        onOpenSettings={openSettingsPage}
      />
    </div>
  )
}
