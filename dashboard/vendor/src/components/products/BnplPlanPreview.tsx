import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarClock, Coins, Store, TrendingUp } from 'lucide-react'
import { BNPL_PLANS, calcBnpl } from '@/lib/bnplCalc'
import { formatDzd, type Locale } from '@/lib/format'
import { merchantProfile } from '@/lib/mock/data'
import { cn } from '@/lib/utils'

type Props = {
  priceDzd: number
  locale: Locale
  className?: string
}

const PLAN_ACCENT = [
  'from-[#0F6E56]/12 to-[#0F6E56]/4 border-primary/25',
  'from-[#0F6E56]/16 to-[#14B8A6]/8 border-primary/30',
  'from-[#0F6E56]/20 to-[#5EEAD4]/12 border-primary/35',
] as const

export default function BnplPlanPreview({ priceDzd, locale, className }: Props) {
  const { t } = useTranslation()
  const commissionPct = merchantProfile.commissionRate

  const plans = useMemo(
    () =>
      BNPL_PLANS.map((plan, i) => ({
        plan,
        accent: PLAN_ACCENT[i],
        result: calcBnpl(priceDzd, plan.months, commissionPct),
      })),
    [priceDzd, commissionPct],
  )

  const hasPrice = priceDzd > 0
  const sample = plans.find((p) => p.plan.months === 6)?.result ?? plans.find((p) => p.result)?.result

  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl border border-border bg-card shadow-[0_8px_30px_rgba(15,110,86,0.06)]',
        className,
      )}
    >
      <div className="border-b border-border bg-gradient-to-r from-primary-surface/90 to-transparent px-4 py-3.5 sm:px-5">
        <div className="flex items-start gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarClock size={18} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{t('products.bnpl.title')}</h3>
            <p className="mt-0.5 text-xs leading-relaxed text-foreground-tertiary">
              {t('products.bnpl.subtitle', { rate: commissionPct })}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {!hasPrice ? (
          <p className="rounded-xl border border-dashed border-border-strong bg-background-secondary/40 px-4 py-6 text-center text-sm text-foreground-tertiary">
            {t('products.bnpl.enterPrice')}
          </p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              {plans.map(({ plan, accent, result }, i) => (
                <article
                  key={plan.months}
                  className={cn(
                    'relative overflow-hidden rounded-xl border bg-gradient-to-br p-4 transition-shadow hover:shadow-md',
                    accent,
                  )}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                      {t('products.bnpl.months', { count: plan.months })}
                    </span>
                    <span className="text-[10px] font-medium text-foreground-tertiary">
                      {t('products.bnpl.marginPct', { pct: plan.clientMarginPct })}
                    </span>
                  </div>
                  {result ? (
                    <>
                      <p className="text-[10px] uppercase tracking-wide text-foreground-tertiary">
                        {t('products.bnpl.monthlyLabel')}
                      </p>
                      <p className="mt-0.5 text-xl font-bold tabular-nums tracking-tight text-primary">
                        {formatDzd(result.monthlyInstallment, locale)}
                      </p>
                      <p className="mt-1 text-[11px] text-foreground-secondary">
                        {t('products.bnpl.perMonth')}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-foreground-tertiary">—</p>
                  )}
                  {i === 1 && (
                    <span className="absolute end-2 top-2 rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                      {t('products.bnpl.popular')}
                    </span>
                  )}
                </article>
              ))}
            </div>

            {sample && (
              <div className="mt-4 grid gap-2 rounded-xl border border-border bg-background-secondary/35 p-3 text-xs sm:grid-cols-3">
                <SummaryRow
                  icon={TrendingUp}
                  label={t('products.bnpl.clientTotal')}
                  value={formatDzd(sample.totalToCollect, locale)}
                />
                <SummaryRow
                  icon={Store}
                  label={t('products.bnpl.merchantPayout')}
                  value={formatDzd(sample.merchantPayout, locale)}
                />
                <SummaryRow
                  icon={Coins}
                  label={t('products.bnpl.commission')}
                  value={formatDzd(sample.merchantCommission, locale)}
                />
              </div>
            )}
          </>
        )}
        <p className="mt-3 text-center text-[10px] leading-relaxed text-foreground-tertiary">
          {t('products.bnpl.disclaimer')}
        </p>
      </div>
    </section>
  )
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={14} className="shrink-0 text-primary/70" />
      <div className="min-w-0">
        <p className="truncate text-foreground-tertiary">{label}</p>
        <p className="font-semibold tabular-nums text-foreground">{value}</p>
      </div>
    </div>
  )
}
