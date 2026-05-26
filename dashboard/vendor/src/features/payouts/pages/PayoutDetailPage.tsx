import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ChevronRight, FileX, Download, Wallet, FileText, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/data/StatusBadge'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { fetchPayout } from '@/lib/api'
import type { Payout } from '@/lib/mock/data'
import { formatDzd, formatDate, type Locale } from '@/lib/format'

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-3.5 last:border-0">
      <span className="text-sm text-foreground-tertiary">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-gradient-to-r from-primary-surface/80 to-transparent px-5 py-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon size={18} className="text-primary" />
          {title}
        </h2>
      </div>
      <div className="px-5 py-1">{children}</div>
    </section>
  )
}

function downloadReceipt(payout: Payout, locale: Locale, labels: Record<string, string>) {
  const lines = [
    labels.title,
    '—'.repeat(40),
    `${labels.reference}: ${payout.reference}`,
    `${labels.financing}: ${payout.financingRef}`,
    `${labels.customer}: ${payout.customerName}`,
    `${labels.product}: ${payout.productName}`,
    `${labels.amount}: ${formatDzd(payout.amountDzd, locale)}`,
    `${labels.method}: ${labels.methodValue}`,
    payout.paidAt ? `${labels.paidDate}: ${formatDate(payout.paidAt, locale)}` : '',
    payout.externalRef ? `${labels.externalRef}: ${payout.externalRef}` : '',
    '—'.repeat(40),
    labels.footer,
  ].filter(Boolean)

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${payout.reference}-receipt.txt`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function PayoutDetailPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const { reference } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ['payout', reference],
    queryFn: () => fetchPayout(reference ?? ''),
  })

  const handleDownload = () => {
    if (!data) return
    downloadReceipt(data, locale, {
      title: t('payouts.receiptTitle'),
      reference: t('payouts.columns.reference'),
      financing: t('payouts.fields.financing'),
      customer: t('payouts.fields.customer'),
      product: t('payouts.fields.product'),
      amount: t('payouts.columns.amount'),
      method: t('payouts.fields.method'),
      methodValue: t(`method.${data.method}`),
      paidDate: t('payouts.fields.paidDate'),
      externalRef: t('payouts.fields.externalRef'),
      footer: t('payouts.receiptFooter'),
    })
    toast.success(t('payouts.receiptDownloaded'))
  }

  if (isLoading) return <Loader />
  if (!data) {
    return (
      <div className="animate-fade-up">
        <section className="rounded-2xl border border-border bg-card shadow-sm">
          <EmptyState icon={FileX} title={t('common.notFound')} />
        </section>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      <Link
        to="/payouts"
        className="mb-4 inline-flex items-center gap-1 text-sm text-foreground-tertiary transition hover:text-primary"
      >
        <ChevronRight size={16} className="ltr:rotate-180" />
        {t('payouts.title')}
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium text-foreground-tertiary">{t('payouts.detailLabel')}</p>
          <h1 className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">{data.reference}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={data.status} />
          {data.status === 'paid' ? (
            <Button variant="secondary" size="sm" onClick={handleDownload}>
              <Download size={15} />
              {t('payouts.downloadReceipt')}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard icon={FileText} title={t('payouts.sections.details')}>
            <DetailRow
              label={t('payouts.fields.financing')}
              value={<span className="tabular-nums">{data.financingRef}</span>}
            />
            <DetailRow label={t('payouts.fields.customer')} value={data.customerName} />
            <DetailRow label={t('payouts.fields.product')} value={data.productName} />
            <DetailRow label={t('payouts.fields.method')} value={t(`method.${data.method}`)} />
            <DetailRow label={t('payouts.fields.expectedDate')} value={formatDate(data.expectedDate, locale)} />
            {data.paidAt ? (
              <DetailRow label={t('payouts.fields.paidDate')} value={formatDate(data.paidAt, locale)} />
            ) : null}
            {data.externalRef ? (
              <DetailRow
                label={t('payouts.fields.externalRef')}
                value={<span className="tabular-nums">{data.externalRef}</span>}
              />
            ) : null}
          </SectionCard>

          {data.method === 'cash_delivery' ? (
            <SectionCard icon={Truck} title={t('payouts.sections.delivery')}>
              <DetailRow label={t('payouts.fields.agent')} value={data.agentName ?? '—'} />
            </SectionCard>
          ) : null}
        </div>

        <section className="h-fit overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:sticky lg:top-6">
          <div className="border-b border-border bg-gradient-to-r from-primary-surface/80 to-transparent px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Wallet size={18} className="text-primary" />
              {t('payouts.amountCardTitle')}
            </h2>
          </div>
          <div className="px-5 py-5">
            <p className="text-3xl font-semibold tabular-nums text-primary">
              {formatDzd(data.amountDzd, locale)}
            </p>
            {data.status !== 'paid' ? (
              <p className="mt-4 text-xs leading-relaxed text-foreground-tertiary">
                {t('payouts.incomingHint')}
              </p>
            ) : (
              <p className="mt-4 text-xs leading-relaxed text-foreground-tertiary">
                {t('payouts.paidHint')}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
