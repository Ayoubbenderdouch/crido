import { useTranslation } from 'react-i18next'
import { Check, Circle, Loader2 } from 'lucide-react'
import type { PayoutStatus } from '@/lib/mock/data'
import { cn } from '@/lib/utils'

const STEPS: PayoutStatus[] = ['pending', 'processing', 'paid']

type Props = { status: PayoutStatus }

export function PayoutWorkflowSteps({ status }: Props) {
  const { t } = useTranslation()
  const idx = STEPS.indexOf(status)

  return (
    <ol className="flex flex-col gap-0 sm:flex-row sm:items-center sm:gap-0">
      {STEPS.map((step, i) => {
        const done = i < idx
        const current = i === idx
        const upcoming = i > idx
        return (
          <li
            key={step}
            className={cn(
              'flex flex-1 items-center gap-3 sm:flex-col sm:gap-2 sm:px-2 sm:text-center',
              i < STEPS.length - 1 && 'sm:relative',
            )}
          >
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition',
                done && 'border-primary bg-primary text-primary-fg',
                current && 'border-primary bg-primary-surface text-primary',
                upcoming && 'border-border bg-background text-foreground-tertiary',
              )}
            >
              {done ? (
                <Check size={16} strokeWidth={2.5} />
              ) : current && step === 'processing' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Circle size={10} className={upcoming ? 'fill-current' : 'fill-primary'} />
              )}
            </span>
            <div className="min-w-0 sm:w-full">
              <p
                className={cn(
                  'text-sm font-semibold',
                  current ? 'text-primary' : done ? 'text-foreground' : 'text-foreground-tertiary',
                )}
              >
                {t(`payouts.workflow.${step}`)}
              </p>
              <p className="text-xs text-foreground-tertiary">{t(`payouts.workflow.${step}Hint`)}</p>
            </div>
            {i < STEPS.length - 1 ? (
              <span
                className={cn(
                  'hidden h-0.5 flex-1 sm:absolute sm:top-[18px] sm:end-0 sm:block sm:w-1/2 sm:translate-x-1/2',
                  done ? 'bg-primary' : 'bg-border',
                )}
                aria-hidden
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
