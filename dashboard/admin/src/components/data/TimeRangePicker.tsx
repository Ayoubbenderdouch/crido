import { useTranslation } from 'react-i18next'
import { CalendarRange } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TIME_RANGE_ORDER, type TimeRangeId, storeTimeRange } from '@/lib/timeRange'

type Props = {
  value: TimeRangeId
  onChange: (range: TimeRangeId) => void
  className?: string
  compact?: boolean
}

export function TimeRangePicker({ value, onChange, className, compact }: Props) {
  const { t } = useTranslation()

  function select(range: TimeRangeId) {
    storeTimeRange(range)
    onChange(range)
  }

  return (
    <div
      className={cn('inline-flex max-w-full flex-wrap items-center gap-2', className)}
      role="group"
      aria-label={t('timeRange.label')}
    >
      {!compact ? (
        <span className="hidden items-center gap-1.5 text-xs font-medium text-foreground-tertiary sm:inline-flex">
          <CalendarRange size={14} strokeWidth={1.75} />
          {t('timeRange.label')}
        </span>
      ) : null}
      <div className="inline-flex flex-wrap gap-1 rounded-xl border border-border bg-background-secondary/80 p-1 shadow-sm">
        {TIME_RANGE_ORDER.map((id) => {
          const active = value === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => select(id)}
              aria-pressed={active}
              className={cn(
                'rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-200',
                compact && 'px-2 py-1',
                active
                  ? 'bg-primary text-primary-fg shadow-[0_4px_14px_-6px_rgba(15,110,86,0.55)]'
                  : 'text-foreground-secondary hover:bg-background hover:text-foreground',
              )}
            >
              {t(`timeRange.${id}`)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
