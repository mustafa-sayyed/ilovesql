import { ShieldCheck, TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { BrandMark } from '@/components/brand/BrandMark'
import { Button } from '@/components/ui/button'
import { useDbStore } from '@/store/db'

const TIPS = [
  'Shift + Enter runs a cell and moves to the next one.',
  'Every query is real PostgreSQL, compiled to WebAssembly.',
  'Your notebook and database are saved in this browser.',
  'Export any result set as CSV or JSON from the results toolbar.',
  'Press Ctrl/⌘ + K to search commands and sample queries.',
]

export function BootScreen() {
  const status = useDbStore((state) => state.status)
  const error = useDbStore((state) => state.error)
  const init = useDbStore((state) => state.init)
  const [tip, setTip] = useState(0)

  useEffect(() => {
    if (status === 'error') return
    const interval = window.setInterval(() => {
      setTip((current) => (current + 1) % TIPS.length)
    }, 2800)
    return () => window.clearInterval(interval)
  }, [status])

  return (
    <div className="canvas-grid relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--background)_72%)]" />

      <div className="relative flex w-full max-w-sm flex-col items-center text-center">
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-3xl bg-primary/25 blur-2xl" />
          <BrandMark className="boot-dot size-14 rounded-2xl [&_svg]:size-7" />
        </div>

        <h1 className="mt-5 font-heading text-2xl font-semibold tracking-tight">ilovesql</h1>
        <p className="mt-1.5 max-w-xs text-[12px] leading-relaxed text-muted-foreground">
          A Postgres notebook that runs entirely in your browser.
        </p>

        {status === 'error' ? (
          <>
            <div className="mt-6 w-full rounded-lg border border-destructive/30 bg-destructive/[0.05] p-3 text-left">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-destructive">
                <TriangleAlert className="size-3.5" />
                Could not start the database
              </div>
              <p className="mt-1.5 font-mono text-[10px] leading-relaxed break-words text-muted-foreground">
                {error ?? 'An unknown error occurred.'}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 h-7 w-full gap-1.5"
                onClick={() => void init()}
              >
                Try again
              </Button>
            </div>
            <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground/70">
              ilovesql needs WebAssembly and IndexedDB. Private browsing modes and some
              hardened browsers block persistent storage.
            </p>
          </>
        ) : (
          <>
            <div className="mt-7 h-1 w-52 overflow-hidden rounded-full bg-muted">
              <div className="shimmer-line h-full w-1/2 rounded-full bg-primary" />
            </div>
            <p className="mt-3 font-mono text-[9px] tracking-[0.18em] text-muted-foreground/70 uppercase">
              Starting PostgreSQL…
            </p>
            <p
              key={tip}
              className="mt-7 min-h-8 max-w-[19rem] animate-in text-[10.5px] leading-relaxed text-muted-foreground/80 fade-in"
            >
              {TIPS[tip]}
            </p>
          </>
        )}

        <div className="mt-9 flex items-center gap-1.5 text-[9px] text-muted-foreground/50">
          <ShieldCheck className="size-3" />
          Nothing leaves this browser
        </div>
        <p className="mt-1 text-[8.5px] text-muted-foreground/35">
          First load fetches the Postgres engine (~16 MB), then it is cached.
        </p>
      </div>
    </div>
  )
}
