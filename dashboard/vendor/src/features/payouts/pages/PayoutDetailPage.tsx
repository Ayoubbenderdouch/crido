import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ChevronRight, FileX, Download } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/data/StatusBadge'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { fetchPayout } from '@/lib/mock/api'
import { formatDzd, formatDate, type Locale } from '@/lib/format'

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
      <span className="text-sm text-foreground-tertiary">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

export default function PayoutDetailPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const { reference } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ['payout', reference],
    queryFn: () => fetchPayout(reference ?? ''),
  })

  if (isLoading) return <Loader />
  if (!data) {
    return (
      <div className="animate-fade-up">
        <Card><EmptyState icon={FileX} title={t('common.notFound')} /></Card>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      <Link
        to="/payouts"
        className="mb-3 inline-flex items-center gap-1 text-sm text-foreground-tertiary transition-colors hover:text-foreground"
      >
        <ChevronRight size={16} className="ltr:rotate-180" />
        {t('payouts.title')}
      </Link>

      <PageHeader title={data.reference}>
        <StatusBadge status={data.status} />
        {data.status === 'paid' ? (
          <Button variant="secondary" size="sm" onClick={() => toast(t('common.actionDemo'))}>
            <Download size={15} />
            {t('payouts.downloadReceipt')}
          </Button>
        ) : null}
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>{t('payouts.sections.details')}</CardTitle></CardHeader>
            <div className="px-5 py-2">
              <Field label={t('payouts.fields.financing')} value={<span className="tabular-nums">{data.financingRef}</span>} />
              <Field label={t('payouts.fields.customer')} value={data.customerName} />
              <Field label={t('payouts.fields.product')} value={data.productName} />
              <Field label={t('payouts.fields.method')} value={t(`method.${data.method}`)} />
              <Field label={t('payouts.fields.expectedDate')} value={formatDate(data.expectedDate, locale)} />
              {data.paidAt ? (
                <Field label={t('payouts.fields.paidDate')} value={formatDate(data.paidAt, locale)} />
              ) : null}
              {data.externalRef ? (
                <Field label={t('payouts.fields.externalRef')} value={<span className="tabular-nums">{data.externalRef}</span>} />
              ) : null}
            </div>
          </Card>

          {data.method === 'cash_delivery' ? (
            <Card>
              <CardHeader><CardTitle>{t('payouts.sections.delivery')}</CardTitle></CardHeader>
              <div className="px-5 py-2">
                <Field label={t('payouts.fields.agent')} value={data.agentName ?? '—'} />
              </div>
            </Card>
          ) : null}
        </div>

        <Card className="h-fit p-5">
          <p className="text-sm text-foreground-secondary">{t('payouts.columns.amount')}</p>
          <p className="mt-2 text-2xl font-medium tabular-nums text-primary">
            {formatDzd(data.amountDzd, locale)}
          </p>
          {data.status !== 'paid' ? (
            <p className="mt-3 text-xs leading-relaxed text-foreground-tertiary">
              {t('payouts.incomingHint')}
            </p>
          ) : null}
        </Card>
      </div>
    </div>
  )
}
