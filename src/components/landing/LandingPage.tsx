import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Code2,
  Command,
  Database,
  Download,
  History,
  LockKeyhole,
  Moon,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Table2,
  Type,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BrandMark } from '@/components/brand/BrandMark'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/theme'

const TABLES = [
  { name: 'customers', count: '120' },
  { name: 'orders', count: '500', active: true },
  { name: 'order_items', count: '1K' },
  { name: 'products', count: '48' },
  { name: 'categories', count: '8' },
]

const RESULT_ROWS = [
  { region: 'North America', revenue: '$84,210', orders: '412', growth: '+18.4%' },
  { region: 'Europe', revenue: '$63,480', orders: '351', growth: '+12.1%' },
  { region: 'Asia Pacific', revenue: '$48,920', orders: '287', growth: '+7.6%' },
  { region: 'Latin America', revenue: '$22,410', orders: '198', growth: '-2.3%' },
]

const YEAR = new Date().getFullYear()

const STEPS = [
  {
    number: '01',
    icon: Zap,
    title: 'Open the workspace',
    body: 'A real Postgres database is ready in your browser, seeded with a storefront you can explore immediately.',
  },
  {
    number: '02',
    icon: Code2,
    title: 'Ask a question in SQL',
    body: 'Write with schema-aware autocomplete, run one cell or the whole notebook, and see results in a clean grid.',
  },
  {
    number: '03',
    icon: BookOpen,
    title: 'Keep the thread',
    body: 'Add markdown notes beside the queries that matter. Everything autosaves locally so your thinking stays put.',
  },
]

function FeatureIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="flex size-9 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary shadow-[inset_0_1px_0_oklch(1_0_0/0.06)]">
      <Icon className="size-4" />
    </span>
  )
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-4 min-w-4 items-center justify-center rounded border border-border/70 bg-background px-1 font-mono text-[8px] text-muted-foreground shadow-sm">
      {children}
    </span>
  )
}

function HeroPreview() {
  return (
    <div className="relative mx-auto mt-14 max-w-6xl animate-in duration-700 fade-in slide-in-from-bottom-6 sm:mt-16">
      <div className="pointer-events-none absolute -inset-x-6 -top-10 bottom-6 rounded-[3rem] bg-gradient-to-t from-primary/10 via-chart-2/5 to-transparent blur-2xl" />

      <div className="relative rounded-[20px] border border-border/70 bg-card/70 p-1.5 shadow-[0_40px_140px_-48px_oklch(0.55_0.2_285_/_0.5)] backdrop-blur sm:p-2">
        <div className="overflow-hidden rounded-xl border border-border/60 bg-background">
          <div className="flex h-9 items-center gap-2 border-b border-border/60 bg-muted/25 px-3">
            <div className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-destructive/70" />
              <span className="size-2 rounded-full bg-warning/70" />
              <span className="size-2 rounded-full bg-success/70" />
            </div>
            <div className="mx-auto flex min-w-0 items-center gap-1.5 rounded-md border border-border/50 bg-background/70 px-2.5 py-1 font-mono text-[8.5px] text-muted-foreground">
              <LockKeyhole className="size-2.5 shrink-0 text-success" />
              <span className="truncate">ilovesql / storefront / weekly-pulse</span>
            </div>
            <span className="hidden items-center gap-1 font-mono text-[8px] text-muted-foreground/60 sm:flex">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </span>
          </div>

          <div className="grid min-h-[430px] grid-cols-1 md:grid-cols-[188px_minmax(0,1fr)]">
            <aside className="hidden border-r border-border/50 bg-muted/10 md:block">
              <div className="flex items-center justify-between px-3 pt-3">
                <span className="text-[10px] font-medium">Schema</span>
                <span className="font-mono text-[8px] text-muted-foreground/60">6 relations</span>
              </div>
              <div className="mx-3 mt-2 flex h-6 items-center gap-1.5 rounded-md border border-border/50 bg-background px-2 font-mono text-[8.5px] text-muted-foreground/60">
                <Search className="size-2.5" />
                Search tables…
              </div>
              <div className="mt-3 px-3 font-mono text-[7.5px] tracking-[0.16em] text-muted-foreground/50 uppercase">
                public
              </div>
              <div className="mt-1 space-y-0.5 px-2">
                {TABLES.map((table) => (
                  <div
                    key={table.name}
                    className={
                      table.active
                        ? 'flex h-6 items-center gap-1.5 rounded-md bg-primary/10 px-2 font-mono text-[9px] text-primary'
                        : 'flex h-6 items-center gap-1.5 rounded-md px-2 font-mono text-[9px] text-muted-foreground/75'
                    }
                  >
                    <Table2 className="size-2.5 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{table.name}</span>
                    <span className="text-[7.5px] text-muted-foreground/45">{table.count}</span>
                  </div>
                ))}
              </div>
              <div className="mx-3 mt-5 flex items-center gap-1.5 border-t border-border/40 pt-2.5 text-[8px] text-muted-foreground/55">
                <span className="size-1.5 rounded-full bg-success" />
                Postgres ready
              </div>
            </aside>

            <div className="min-w-0 p-3 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 font-mono text-[7.5px] tracking-[0.16em] text-muted-foreground/55 uppercase">
                    <span>notebook</span>
                    <span className="text-muted-foreground/25">/</span>
                    <span>analysis</span>
                  </div>
                  <h3 className="mt-1.5 font-heading text-base font-semibold tracking-tight sm:text-lg">
                    Where did this week&apos;s revenue come from?
                  </h3>
                </div>
                <span className="hidden shrink-0 items-center gap-1 text-[8px] text-muted-foreground/50 sm:flex">
                  <Check className="size-2.5 text-success" />
                  Saved
                </span>
              </div>

              <div className="mt-4 overflow-hidden rounded-lg border border-border/60 bg-card/30">
                <div className="flex h-7 items-center gap-2 border-b border-border/40 bg-muted/20 px-2.5">
                  <span className="flex size-4 items-center justify-center rounded bg-success/15 text-success">
                    <Play className="size-2 fill-current" />
                  </span>
                  <span className="font-mono text-[8px] text-muted-foreground/60">In [4]</span>
                  <span className="flex items-center gap-1 font-mono text-[8px] text-success">
                    <span className="size-1 rounded-full bg-success" />
                    42 ms
                  </span>
                </div>

                <pre className="overflow-x-auto p-3 font-mono text-[9px] leading-5 sm:text-[10.5px]">
                  <code>
                    <span className="text-primary">select</span> region,{'\n'}
                    {'       '}sum(total) <span className="text-primary">as</span> revenue,{'\n'}
                    {'       '}count(*) <span className="text-primary">as</span> orders{'\n'}
                    <span className="text-primary">from</span> orders{'\n'}
                    <span className="text-primary">where</span> created_at &gt;= now() -{' '}
                    <span className="text-primary">interval</span>{' '}
                    <span className="text-success">&apos;7 days&apos;</span>
                    {'\n'}
                    <span className="text-primary">group by</span> region{'\n'}
                    <span className="text-primary">order by</span> revenue{' '}
                    <span className="text-primary">desc</span>;
                  </code>
                </pre>

                <div className="flex items-center gap-2 border-t border-border/40 bg-muted/15 px-2.5 py-1.5 font-mono text-[8px] text-muted-foreground/60">
                  <span>1,248 rows</span>
                  <span className="text-muted-foreground/25">·</span>
                  <span>4 columns</span>
                  <span className="ml-auto hidden items-center gap-1 sm:flex">
                    <Download className="size-2.5" />
                    Export
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[430px] border-collapse text-left font-mono text-[8.5px] sm:text-[9.5px]">
                    <thead className="border-b border-border/40 text-[7.5px] tracking-wide text-muted-foreground/50 uppercase">
                      <tr>
                        <th className="px-3 py-1.5 font-medium">region</th>
                        <th className="px-3 py-1.5 text-right font-medium">revenue</th>
                        <th className="px-3 py-1.5 text-right font-medium">orders</th>
                        <th className="px-3 py-1.5 text-right font-medium">growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RESULT_ROWS.map((row) => (
                        <tr key={row.region} className="border-b border-border/25 last:border-0">
                          <td className="px-3 py-1.5 text-foreground/75">{row.region}</td>
                          <td className="px-3 py-1.5 text-right text-foreground/80">{row.revenue}</td>
                          <td className="px-3 py-1.5 text-right text-muted-foreground">{row.orders}</td>
                          <td
                            className={
                              row.growth.startsWith('-')
                                ? 'px-3 py-1.5 text-right text-destructive'
                                : 'px-3 py-1.5 text-right text-success'
                            }
                          >
                            {row.growth}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-3 flex gap-2 rounded-lg border border-primary/15 bg-primary/[0.035] p-2.5">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Type className="size-2.5" />
                </span>
                <p className="text-[9px] leading-relaxed text-muted-foreground">
                  <span className="font-medium text-foreground">Takeaway.</span> North America is
                  driving most of the lift, but Latin America is the one to watch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -left-2 bottom-16 hidden items-center gap-2.5 rounded-xl border border-border/60 bg-card/90 px-3 py-2.5 shadow-2xl backdrop-blur md:flex lg:-left-8">
        <span className="flex size-7 items-center justify-center rounded-lg bg-success/10 text-success">
          <ShieldCheck className="size-3.5" />
        </span>
        <div>
          <p className="text-[10px] font-medium">Stays in your browser</p>
          <p className="text-[8px] text-muted-foreground/65">No server. No uploads.</p>
        </div>
      </div>

      <div className="absolute -right-3 top-24 hidden items-center gap-2 rounded-full border border-border/60 bg-card/90 px-3 py-1.5 shadow-xl backdrop-blur lg:flex lg:-right-6">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-success/50" />
          <span className="relative inline-flex size-1.5 rounded-full bg-success" />
        </span>
        <span className="font-mono text-[8px] text-muted-foreground">Postgres · WASM</span>
      </div>
    </div>
  )
}

export function LandingPage() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <div className="relative min-h-svh overflow-x-hidden bg-background text-foreground">
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="canvas-grid absolute inset-0 opacity-55 [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]" />
        <div className="absolute top-[-24rem] left-1/2 h-[46rem] w-[72rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[22rem] right-[-14rem] h-[28rem] w-[28rem] rounded-full bg-chart-2/10 blur-[110px]" />
        <div className="absolute bottom-[-18rem] left-[-12rem] h-[30rem] w-[30rem] rounded-full bg-chart-5/[0.07] blur-[110px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <BrandMark className="size-8 rounded-xl [&_svg]:size-4" />
            <span className="font-heading text-[15px] font-semibold tracking-tight">ilovesql</span>
            <span className="hidden rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 font-mono text-[8px] tracking-[0.12em] text-muted-foreground/70 uppercase sm:inline">
              local-first
            </span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 text-[11px] text-muted-foreground lg:flex">
            <a
              href="#features"
              className="rounded-md px-2.5 py-1.5 transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#how"
              className="rounded-md px-2.5 py-1.5 transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              How it works
            </a>
            <a
              href="#privacy"
              className="rounded-md px-2.5 py-1.5 transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              Privacy
            </a>
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
            </Button>
            <Button asChild size="sm" className="h-8 gap-1.5 px-3 shadow-sm">
              <Link to="/notebooks">
                <span className="hidden sm:inline">Open workspace</span>
                <span className="sm:hidden">Open app</span>
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative">
        <section className="px-5 pt-16 pb-14 sm:px-8 sm:pt-24 lg:pt-28">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex animate-in items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-[10px] text-muted-foreground shadow-sm backdrop-blur duration-500 fade-in">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-success/55" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-success" />
                </span>
                Postgres in your browser
                <span className="h-3 w-px bg-border" />
                <span className="text-muted-foreground/65">No account needed</span>
              </div>

              <h1 className="mt-6 animate-in text-balance font-heading text-[2.9rem] leading-[0.98] font-semibold tracking-[-0.055em] duration-700 fade-in slide-in-from-bottom-3 sm:text-6xl lg:text-[4.9rem]">
                Find the story
                <span className="block bg-gradient-to-r from-primary via-chart-5 to-chart-2 bg-clip-text pb-1 text-transparent">
                  hidden in your data.
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl animate-in text-pretty text-[14px] leading-relaxed text-muted-foreground duration-700 fade-in slide-in-from-bottom-3 sm:text-[15px]">
                A local-first SQL notebook with a real Postgres engine, a schema explorer, and room
                for the notes that matter. Query, explore, and keep your thinking — all in one tab.
              </p>

              <div className="mt-7 flex animate-in flex-col items-center justify-center gap-2 duration-700 fade-in slide-in-from-bottom-3 sm:flex-row">
                <Button asChild size="lg" className="h-10 rounded-xl px-4 shadow-lg shadow-primary/15">
                  <Link to="/notebooks">
                    Start exploring
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-10 rounded-xl px-4">
                  <a href="#how">
                    <Play className="size-3.5" />
                    See how it works
                  </a>
                </Button>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[9.5px] text-muted-foreground/70">
                <span className="flex items-center gap-1">
                  <Check className="size-3 text-success" />
                  100% local
                </span>
                <span className="flex items-center gap-1">
                  <Check className="size-3 text-success" />
                  Zero setup
                </span>
                <span className="flex items-center gap-1">
                  <Check className="size-3 text-success" />
                  Autosaved
                </span>
              </div>
            </div>

            <HeroPreview />

            <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/50 sm:grid-cols-4">
              {[
                ['100%', 'Local by default'],
                ['0', 'Accounts required'],
                ['1', 'Browser tab'],
                ['∞', 'Notebooks'],
              ].map(([value, label]) => (
                <div key={label} className="bg-background/80 px-4 py-3 text-center backdrop-blur">
                  <p className="font-heading text-lg font-semibold tracking-tight">{value}</p>
                  <p className="mt-0.5 text-[8.5px] tracking-wide text-muted-foreground/65 uppercase">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-24 px-5 py-24 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="font-mono text-[9px] tracking-[0.2em] text-primary uppercase">
                The workspace
              </p>
              <h2 className="mt-3 text-balance font-heading text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-[2.75rem]">
                Everything you need to follow a hunch.
              </h2>
              <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
                A focused set of tools for asking better questions — without tabs full of context,
                connection strings, or setup screens.
              </p>
            </div>

            <div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-6">
              <article className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-5 transition-colors hover:border-primary/25 hover:bg-card/60 md:col-span-2 lg:col-span-4">
                <FeatureIcon icon={BookOpen} />
                <h3 className="mt-4 font-heading text-base font-semibold tracking-tight">
                  Queries and context, together.
                </h3>
                <p className="mt-2 max-w-lg text-[12px] leading-relaxed text-muted-foreground">
                  SQL cells for the work, markdown cells for the why. Build a notebook that reads
                  like a train of thought instead of a pile of scratch tabs.
                </p>

                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-border/50 bg-background/60 p-2.5">
                    <div className="flex items-center gap-1.5 text-[8px] text-success">
                      <Play className="size-2 fill-current" />
                      <span className="font-mono">In [7]</span>
                      <span className="ml-auto font-mono text-muted-foreground/45">38 ms</span>
                    </div>
                    <pre className="mt-2 overflow-hidden font-mono text-[9px] leading-4">
                      <code>
                        <span className="text-primary">select</span> category,{'\n'}
                        {'       '}sum(total) <span className="text-primary">as</span> revenue{'\n'}
                        <span className="text-primary">from</span> orders{'\n'}
                        <span className="text-primary">group by</span> category;
                      </code>
                    </pre>
                  </div>
                  <div className="rounded-lg border border-primary/15 bg-primary/[0.04] p-2.5">
                    <div className="flex items-center gap-1.5 text-[8px] text-primary">
                      <Type className="size-2.5" />
                      <span className="font-mono">Note</span>
                    </div>
                    <p className="mt-2 text-[9px] leading-relaxed text-muted-foreground">
                      <span className="font-medium text-foreground">Pattern spotted.</span> Bundles
                      outperform single items by almost 2×. Worth checking whether that holds across
                      regions.
                    </p>
                  </div>
                </div>
              </article>

              <article
                id="privacy"
                className="scroll-mt-24 rounded-2xl border border-border/60 bg-card/40 p-5 transition-colors hover:border-primary/25 hover:bg-card/60 md:col-span-2 lg:col-span-2"
              >
                <FeatureIcon icon={LockKeyhole} />
                <h3 className="mt-4 font-heading text-base font-semibold tracking-tight">
                  Private by design.
                </h3>
                <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                  Your notebook and Postgres database live in this tab. No account, no sync, no
                  hidden network.
                </p>
                <div className="relative mt-5 flex h-24 items-center justify-center">
                  <span className="absolute size-20 rounded-full border border-primary/10" />
                  <span className="absolute size-14 rounded-full border border-primary/15" />
                  <span className="absolute size-20 rounded-full bg-primary/10 blur-xl" />
                  <span className="relative flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-card text-primary shadow-lg">
                    <ShieldCheck className="size-4" />
                  </span>
                </div>
              </article>

              <article className="rounded-2xl border border-border/60 bg-card/40 p-5 transition-colors hover:border-primary/25 hover:bg-card/60 lg:col-span-2">
                <FeatureIcon icon={Table2} />
                <h3 className="mt-4 font-heading text-base font-semibold tracking-tight">
                  Schema-aware writing.
                </h3>
                <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                  Browse every relation, search columns, and get completions from the database you
                  are actually connected to.
                </p>
                <div className="mt-5 space-y-0.5 rounded-lg border border-border/50 bg-background/50 p-1.5">
                  {TABLES.slice(0, 4).map((table) => (
                    <div
                      key={table.name}
                      className={
                        table.active
                          ? 'flex h-6 items-center gap-1.5 rounded-md bg-primary/10 px-2 font-mono text-[8.5px] text-primary'
                          : 'flex h-6 items-center gap-1.5 rounded-md px-2 font-mono text-[8.5px] text-muted-foreground/70'
                      }
                    >
                      <Table2 className="size-2.5" />
                      <span className="flex-1">{table.name}</span>
                      <span className="text-[7.5px] text-muted-foreground/40">{table.count}</span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-border/60 bg-card/40 p-5 transition-colors hover:border-primary/25 hover:bg-card/60 lg:col-span-2">
                <FeatureIcon icon={Command} />
                <h3 className="mt-4 font-heading text-base font-semibold tracking-tight">
                  Command-first.
                </h3>
                <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                  Jump to a notebook, run everything, or open settings without reaching for the
                  mouse.
                </p>
                <div className="mt-5 rounded-lg border border-border/50 bg-background/50 p-2">
                  <div className="flex items-center gap-1.5 rounded-md border border-border/50 bg-background px-2 py-1.5 text-[8.5px] text-muted-foreground/60">
                    <Search className="size-2.5" />
                    <span className="flex-1">Run a command…</span>
                    <Kbd>⌘</Kbd>
                    <Kbd>K</Kbd>
                  </div>
                  <div className="mt-1.5 space-y-0.5">
                    {['Run all cells', 'Clear outputs', 'Open settings'].map((item) => (
                      <div
                        key={item}
                        className="flex h-5 items-center rounded px-1.5 font-mono text-[8px] text-muted-foreground/65"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              <article className="rounded-2xl border border-border/60 bg-card/40 p-5 transition-colors hover:border-primary/25 hover:bg-card/60 lg:col-span-2">
                <FeatureIcon icon={History} />
                <h3 className="mt-4 font-heading text-base font-semibold tracking-tight">
                  Keep a trail.
                </h3>
                <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                  Query history and autosaved notebooks make it easy to retrace a step — and export
                  any result when it is time to share.
                </p>
                <div className="mt-5 space-y-1.5">
                  {[
                    ['Revenue by region', '2m'],
                    ['Top products this week', '18m'],
                    ['Cart abandonment', '1h'],
                  ].map(([label, time]) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 rounded-md border border-border/40 bg-background/50 px-2 py-1.5"
                    >
                      <span className="size-1 rounded-full bg-primary/60" />
                      <span className="flex-1 truncate font-mono text-[8px] text-muted-foreground">
                        {label}
                      </span>
                      <span className="font-mono text-[7px] text-muted-foreground/40">{time}</span>
                    </div>
                  ))}
                  <div className="flex gap-1 pt-1">
                    <span className="rounded border border-border/50 bg-background px-1.5 py-0.5 font-mono text-[7px] text-muted-foreground/60">
                      CSV
                    </span>
                    <span className="rounded border border-border/50 bg-background px-1.5 py-0.5 font-mono text-[7px] text-muted-foreground/60">
                      JSON
                    </span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="how" className="scroll-mt-20 border-y border-border/50 bg-muted/10">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:py-28">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <p className="font-mono text-[9px] tracking-[0.2em] text-primary uppercase">
                How it works
              </p>
              <h2 className="mt-3 text-balance font-heading text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-[2.75rem]">
                From a blank tab to a real answer.
              </h2>
              <p className="mt-4 max-w-md text-[13px] leading-relaxed text-muted-foreground">
                No connection strings. No provisioning. The first load brings up Postgres and a
                demo storefront; after that, everything is ready the moment you open the tab.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-6 h-8 gap-1.5 px-3">
                <Link to="/notebooks">
                  Open the workspace
                  <ArrowRight className="size-3" />
                </Link>
              </Button>
            </div>

            <div className="space-y-3">
              {STEPS.map(({ icon: Icon, ...step }) => (
                <div
                  key={step.number}
                  className="group flex gap-4 rounded-2xl border border-border/60 bg-card/45 p-5 transition-colors hover:border-primary/25 hover:bg-card/65 sm:p-6"
                >
                  <div className="flex flex-col items-center gap-3">
                    <span className="font-mono text-[9px] text-primary/70">{step.number}</span>
                    <span className="flex size-8 items-center justify-center rounded-lg border border-border/60 bg-background/60 text-muted-foreground group-hover:border-primary/20 group-hover:text-primary">
                      <Icon className="size-3.5" />
                    </span>
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <h3 className="font-heading text-[15px] font-semibold tracking-tight">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 max-w-lg text-[11.5px] leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-2 px-2 pt-2 text-[9px] text-muted-foreground/60">
                <Database className="size-3" />
                PostgreSQL, compiled to WebAssembly and cached after the first load.
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-24 sm:px-8 lg:py-28">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-border/60 bg-card/55 px-6 py-16 text-center sm:px-12 sm:py-20">
            <div className="canvas-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
            <div className="pointer-events-none absolute top-[-10rem] left-1/2 h-[28rem] w-[42rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[100px]" />

            <div className="relative mx-auto max-w-2xl">
              <div className="relative mx-auto flex size-12 items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-primary/25 blur-xl" />
                <BrandMark className="relative size-12 rounded-2xl [&_svg]:size-6" />
              </div>
              <h2 className="mt-6 text-balance font-heading text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Your next answer is one query away.
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-[13px] leading-relaxed text-muted-foreground">
                Open the workspace and start exploring a real Postgres database. No signup, no
                setup, and nothing leaves this tab.
              </p>
              <div className="mt-7 flex flex-col items-center justify-center gap-2 sm:flex-row">
                <Button asChild size="lg" className="h-10 rounded-xl px-4">
                  <Link to="/notebooks">
                    Open workspace
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="h-10 rounded-xl px-4">
                  <a href="#features">
                    Explore the features
                    <ArrowUpRight className="size-3.5" />
                  </a>
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[9px] text-muted-foreground/55">
                <span className="flex items-center gap-1">
                  <Sparkles className="size-3 text-primary/70" />
                  Local-first
                </span>
                <span className="flex items-center gap-1">
                  <Database className="size-3 text-primary/70" />
                  Real Postgres
                </span>
                <span className="flex items-center gap-1">
                  <LockKeyhole className="size-3 text-primary/70" />
                  Private by default
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center">
          <div className="flex items-center gap-2.5">
            <BrandMark className="size-7 rounded-lg [&_svg]:size-3.5" />
            <div>
              <p className="font-heading text-[12px] font-semibold tracking-tight">ilovesql</p>
              <p className="text-[8.5px] text-muted-foreground/55">Local-first SQL notebook</p>
            </div>
          </div>
          <nav className="flex items-center gap-4 text-[10px] text-muted-foreground md:ml-auto">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#how" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#privacy" className="transition-colors hover:text-foreground">
              Privacy
            </a>
          </nav>
          <p className="text-[9px] text-muted-foreground/45 md:ml-4">© {YEAR} ilovesql</p>
        </div>
      </footer>
    </div>
  )
}
