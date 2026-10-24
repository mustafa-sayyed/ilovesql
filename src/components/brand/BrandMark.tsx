import { Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex size-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary via-primary to-chart-2 text-primary-foreground shadow-[inset_0_1px_0_oklch(1_0_0/0.18),0_2px_8px_-2px_oklch(0.55_0.22_285/0.5)]',
        className,
      )}
    >
      <Terminal className="size-3.5" strokeWidth={2.4} />
    </div>
  )
}
