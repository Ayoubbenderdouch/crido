import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Wallet } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type Column } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { cn } from '@/lib/utils'
import { fetchPayouts } from '@/lib/api'
import type { Payout } from '@/lib/mock/data'
import { formatDzd, formatDate, type Locale } from '@/lib/format'

const TABS = ['all', 'pending', 'paid'] as const

export default function PayoutsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const navigate = useNavigate()
  const [tab, setTab] = useState<(typeof TABS)[number]>('all')

  const { data, isLoading } = useQuery({ queryKey: ['payouts'], queryFn: fetchPayouts })
  const all = data ?? []
  const rows = all.filter((p) => {
    if (tab === 'all') return true
    if (tab === 'paid') return p.status === 'paid'
    return p.status !== 'paid'
  })

  const pendingTotal = all
    .filter((p) => p.status !== 'paid')
    .reduce((sum, p) => sum + p.amountDzd, 0)

  const columns: Column<Payout>[] = [
    {
      key: 'reference',
      header: t('payouts.columns.reference'),
      cell: (p) => <span className="font-medium tabular-nums text-foreground">{p.reference}</span>,
    },
    {
      key: 'financing',
      header: t('payouts.columns.financing'),
      cell: (p) => <span className="tabular-nums text-foreground-secondary">{p.financingRef}</span>,
    },
    {
      key: 'amount',
      header: t('payouts.columns.amount'),
      align: 'end',
      cell: (p) => <span className="tabular-nums font-medium text-foreground">{formatDzd(p.amountDzd, locale)}</span>,
    },
    { key: 'method', header: t('payouts.columns.method'), cell: (p) => t(`method.${p.method}`) },
    {
      key: 'status',
      header: t('payouts.columns.status'),
      align: 'end',
      cell: (p) => <StatusBadge status={p.status} />,
    },
    {
      key: 'date',
      header: t('payouts.columns.date'),
      align: 'end',
      cell: (p) => <span className="text-foreground-tertiary">{formatDate(p.expectedDate, locale)}</span>,
    },
  ]

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary-surface px-3 py-1 text-xs font-medium text-primary">
          <Wallet size={14} />
          {t('payouts.badge')}
        </div>
        <PageHeader title={t('payouts.title')} subtitle={t('payouts.subtitle')} />
      </div>

      {pendingTotal > 0 ? (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary-surface/90 to-transparent px-5 py-4 shadow-sm">
          <p className="text-xs text-foreground-tertiary">{t('payouts.pendingLabel')}</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-primary">
            {formatDzd(pendingTotal, locale)}
          </p>
        </div>
      ) : null}

      <div className="mb-5 flex flex-wrap gap-1 rounded-2xl border border-border bg-card p-1 shadow-sm">
        {TABS.map((tb) => (
          <button
            key={tb}
            type="button"
            onClick={() => setTab(tb)}
            className={cn(
              'flex flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-sm transition-all sm:flex-none',
              tab === tb
                ? 'bg-primary font-medium text-primary-fg shadow-sm'
                : 'text-foreground-secondary hover:bg-background-secondary hover:text-foreground',
            )}
          >
            {t(`payouts.tabs.${tb}`)}
          </button>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {isLoading ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState icon={Wallet} title={t('common.noResults')} />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(p) => p.reference}
            onRowClick={(p) => navigate(`/payouts/${p.reference}`)}
          />
        )}
      </section>
    </div>
  )
}
