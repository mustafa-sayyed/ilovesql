import { Type } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useNotebookStore } from '@/store/notebook'
import { useSettingsStore } from '@/store/settings'
import { toast } from 'sonner'

export function SettingsPage() {
  const markdownEnabled = useSettingsStore((state) => state.markdownEnabled)
  const setMarkdownEnabled = useSettingsStore((state) => state.setMarkdownEnabled)

  const handleMarkdownChange = (enabled: boolean) => {
    setMarkdownEnabled(enabled)

    if (!enabled) {
      const notebook = useNotebookStore.getState()
      const active = notebook.cells.find((cell) => cell.id === notebook.activeCellId)
      if (active?.type === 'markdown') {
        const firstSql = notebook.cells.find((cell) => cell.type === 'sql')
        if (firstSql) notebook.setActiveCell(firstSql.id)
      }
    }

    toast.success(enabled ? 'Markdown cells enabled' : 'Markdown cells disabled')
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6">
        <h1 className="font-heading text-[22px] font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-[11px] text-muted-foreground/75">
          Preferences are saved in this browser.
        </p>
      </div>

      <section className="rounded-xl border border-border/60 bg-card/50">
        <div className="border-b border-border/50 px-4 py-2.5">
          <h2 className="font-heading text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            Notebook
          </h2>
        </div>

        <div className="flex items-start justify-between gap-4 p-4">
          <div className="flex min-w-0 gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Type className="size-4" />
            </span>
            <div className="min-w-0">
              <label
                htmlFor="markdown-cells"
                className="cursor-pointer text-[12px] font-medium"
              >
                Enable markdown cells
              </label>
              <p className="mt-1 max-w-md text-[11px] leading-relaxed text-muted-foreground">
                Show markdown notes, the Markdown add button, and cell conversion. Existing notes
                are kept and hidden while this is off.
              </p>
            </div>
          </div>

          <Switch
            id="markdown-cells"
            checked={markdownEnabled}
            onCheckedChange={handleMarkdownChange}
            aria-label="Enable markdown cells"
            className="mt-0.5"
          />
        </div>
      </section>

      <p className="mt-4 text-[10px] text-muted-foreground/55">
        Markdown is off by default. Turning it off does not delete any notes.
      </p>
    </div>
  )
}
