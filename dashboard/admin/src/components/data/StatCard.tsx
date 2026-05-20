import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Props = {
  label: string
  value: string
  icon: LucideIcon
  hint?: string
  accent?: 'default' | 'warning' | 'danger'
}

const ACCENT = {
  default: 'bg-primary-surface text-primary',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/12 text-danger',
}

export function StatCard({ label, value, icon: Icon, hint, accent = 'default' }: Props) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-foreground-secondary">{label}</p>
          <p className="mt-2 text-2xl font-medium tabular-nums text-foreground">{value}</p>
          {hint ? (
            <p className="mt-1 text-xs text-foreground-tertiary">{hint}</p>
          ) : null}
        </div>
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-md',
            ACCENT[accent],
          )}
        >
          <Icon size={20} strokeWidth={1.5} />
        </span>
      </div>
    </Card>
  )
}
