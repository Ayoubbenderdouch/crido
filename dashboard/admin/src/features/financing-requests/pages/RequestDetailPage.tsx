import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ChevronRight, FileX } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/data/StatusBadge'
import { TierBadge } from '@/components/data/TierBadge'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { fetchRequest } from '@/lib/mock/api'
import { formatDzd, type Locale } from '@/lib/format'

function computeBreakdown(amount: number, months: number) {
  const marginPct = months >= 12 ? 15 : months >= 6 ? 8 : 5
  const commission = Math.round(amount * 0.05)
  const margin = Math.round((amount * marginPct) / 100)
  const total = amount + margin
  return {
    marginPct,
    commission,
    payout: amount - commission,
    margin,
    total,
    monthly: Math.round(total / months),
    profit: commission + margin,
  }
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-foreground-tertiary">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function BreakdownRow({ label, value, strong, accent }: {
  label: string
  value: string
  strong?: boolean
  accent?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className={accent ? 'text-sm text-primary' : 'text-sm text-foreground-secondary'}>
        {label}
      </span>
      <span
        className={[
          'tabular-nums',
          strong ? 'text-base font-medium' : 'text-sm',
          accent ? 'text-primary' : 'text-foreground',
        ].join(' ')}
      >
        {value}
      </span>
    </div>
  )
}

export default function RequestDetailPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const { reference } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ['request', reference],
    queryFn: () => fetchRequest(reference ?? ''),
  })

  if (isLoading) return <Loader />
  if (!data) {
    return (
      <div className="animate-fade-up">
        <Card>
          <EmptyState icon={FileX} title={t('common.notFound')} />
        </Card>
      </div>
    )
  }

  const b = computeBreakdown(data.amountDzd, data.planMonths)
  const fmt = (n: number) => formatDzd(n, locale)
  const demo = () => toast(t('common.actionDemo'))

  return (
    <div className="animate-fade-up">
      <Link
        to="/financing-requests"
        className="mb-3 inline-flex items-center gap-1 text-sm text-foreground-tertiary transition-colors hover:text-foreground"
      >
        <ChevronRight size={16} className="ltr:rotate-180" />
        {t('requests.title')}
      </Link>

      <PageHeader title={data.reference}>
        <StatusBadge status={data.status} />
        <Button variant="ghost" size="sm" onClick={demo}>{t('common.reject')}</Button>
        <Button size="sm" onClick={demo}>{t('common.approve')}</Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>{t('requests.sections.client')}</CardTitle></CardHeader>
            <div className="px-5 py-2">
              <Field
                label={t('clients.columns.client')}
                value={
                  <Link to={`/clients/${data.clientId}`} className="inline-flex items-center gap-2 text-primary hover:underline">
                    <TierBadge tier={data.clientTier} />
                    {data.clientName}
                  </Link>
                }
              />
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t('requests.sections.merchant')}</CardTitle></CardHeader>
            <div className="px-5 py-2">
              <Field label={t('merchants.columns.merchant')} value={data.merchantName} />
              <div className="border-t border-border" />
              <Field label={t('merchants.columns.source')} value={t(`source.${data.merchantSource}`)} />
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t('requests.sections.product')}</CardTitle></CardHeader>
            <div className="px-5 py-2">
              <Field label={t('requests.columns.product')} value={data.productName} />
              <div className="border-t border-border" />
              <Field label={t('requests.columns.plan')} value={t('requests.months', { count: data.planMonths })} />
              <div className="border-t border-border" />
              <Field label={t('requests.columns.amount')} value={fmt(data.amountDzd)} />
            </div>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader><CardTitle>{t('requests.breakdown.title')}</CardTitle></CardHeader>
          <div className="px-5 py-3">
            <BreakdownRow label={t('requests.breakdown.principal')} value={fmt(data.amountDzd)} />
            <BreakdownRow label={t('requests.breakdown.merchantCommission')} value={`− ${fmt(b.commission)}`} />
            <div className="border-t border-border" />
            <BreakdownRow label={t('requests.breakdown.merchantPayout')} value={fmt(b.payout)} />
            <BreakdownRow label={t('requests.breakdown.clientMargin')} value={`+ ${fmt(b.margin)}`} />
            <div className="border-t border-border" />
            <BreakdownRow label={t('requests.breakdown.totalToCollect')} value={fmt(b.total)} strong />
            <BreakdownRow label={t('requests.breakdown.monthly')} value={fmt(b.monthly)} strong accent />
            <div className="my-1 border-t border-border" />
            <div className="rounded-md bg-primary-surface px-3 py-2.5">
              <BreakdownRow label={t('requests.breakdown.profit')} value={fmt(b.profit)} strong accent />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
