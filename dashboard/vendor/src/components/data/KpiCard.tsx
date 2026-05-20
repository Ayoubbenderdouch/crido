import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Sparkline } from '@/components/charts/Sparkline'
import { cn } from '@/lib/utils'

type Props = {
  label: string
  value: string
  icon: LucideIcon
  trend?: number
  spark?: number[]
  sparkColor?: string
  accent?: 'default' | 'warning'
}

const ACCENT = {
  default: 'bg-primary-surface text-primary',
  warning: 'bg-warning/15 text-warning',
}

export function KpiCard({
  label, value, icon: Icon, trend, spark, sparkColor = '#0F6E56', accent = 'default',
}: Props) {
  const up = (trend ?? 0) >= 0

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-foreground-secondary">{label}</p>
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
            ACCENT[accent],
          )}
        >
          <Icon size={18} strokeWidth={1.5} />
        </span>
      </div>

      <p className="mt-2.5 text-2xl font-medium tabular-nums text-foreground">{value}</p>

      <div className="mt-2 flex items-end justify-between gap-3">
        {trend !== undefined ? (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-medium',
              up ? 'text-success' : 'text-danger',
            )}
          >
            {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {up ? '+' : ''}{trend}%
          </span>
        ) : (
          <span />
        )}
        {spark ? (
          <div className="h-9 w-24">
            <Sparkline data={spark} color={sparkColor} />
          </div>
        ) : null}
      </div>
    </Card>
  )
}
