import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { CreditCard } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type Column } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { cn } from '@/lib/utils'
import { fetchFinancings } from '@/lib/api'
import type { Financing, FinancingStatus } from '@/lib/mock/data'
import { formatDzd, formatDate, type Locale } from '@/lib/format'

const TABS: { key: 'all' | 'active' | 'completed'; status?: FinancingStatus }[] = [
  { key: 'all' },
  { key: 'active', status: 'active' },
  { key: 'completed', status: 'completed' },
]

export default function FinancingsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const navigate = useNavigate()
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('all')

  const { data, isLoading } = useQuery({ queryKey: ['financings'], queryFn: fetchFinancings })
  const all = data ?? []
  const activeTab = TABS.find((tb) => tb.key === tab) ?? TABS[0]
  const rows = all.filter((f) => !activeTab.status || f.status === activeTab.status)
  const countOf = (status?: FinancingStatus) =>
    status ? all.filter((f) => f.status === status).length : all.length

  const columns: Column<Financing>[] = [
    {
      key: 'reference',
      header: t('financings.columns.reference'),
      cell: (f) => <span className="font-medium tabular-nums text-foreground">{f.reference}</span>,
    },
    { key: 'customer', header: t('financings.columns.customer'), cell: (f) => f.customerName },
    {
      key: 'product',
      header: t('financings.columns.product'),
      cell: (f) => <span className="text-foreground-secondary">{f.productName}</span>,
    },
    {
      key: 'total',
      header: t('financings.columns.total'),
      align: 'end',
      cell: (f) => <span className="tabular-nums">{formatDzd(f.totalAmountDzd, locale)}</span>,
    },
    {
      key: 'payout',
      header: t('financings.columns.payout'),
      align: 'end',
      cell: (f) => (
        <div className="flex flex-col items-end">
          <span className="tabular-nums font-medium text-foreground">
            {formatDzd(f.payoutDzd, locale)}
          </span>
          <span className={cn('text-xs', f.payoutPaid ? 'text-success' : 'text-warning')}>
            {f.payoutPaid ? t('financings.payoutPaid') : t('financings.payoutPending')}
          </span>
        </div>
      ),
    },
    {
      key: 'plan',
      header: t('financings.columns.plan'),
      cell: (f) => t('requests.months', { count: f.planMonths }),
    },
    {
      key: 'status',
      header: t('financings.columns.status'),
      align: 'end',
      cell: (f) => <StatusBadge status={f.status} />,
    },
    {
      key: 'activated',
      header: t('financings.columns.activated'),
      align: 'end',
      cell: (f) => <span className="text-foreground-tertiary">{formatDate(f.activatedAt, locale)}</span>,
    },
  ]

  return (
    <div className="animate-fade-up">
      <PageHeader title={t('financings.title')} subtitle={t('financings.subtitle')} />

      <div className="mb-5 flex flex-wrap gap-1 rounded-2xl border border-border bg-card p-1 shadow-sm">
        {TABS.map((tb) => {
          const count = countOf(tb.status)
          return (
            <button
              key={tb.key}
              type="button"
              onClick={() => setTab(tb.key)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm transition-all sm:flex-none',
                tab === tb.key
                  ? 'bg-primary font-medium text-primary-fg shadow-sm'
                  : 'text-foreground-secondary hover:bg-background-secondary hover:text-foreground',
              )}
            >
              {t(`financings.tabs.${tb.key}`)}
              {count > 0 ? (
                <span
                  className={cn(
                    'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium',
                    tab === tb.key ? 'bg-primary-fg/20 text-primary-fg' : 'bg-background-secondary text-foreground-tertiary',
                  )}
                >
                  {count}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {isLoading ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState icon={CreditCard} title={t('common.noResults')} />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(f) => f.reference}
            onRowClick={(f) => navigate(`/financings/${f.reference}`)}
          />
        )}
      </section>

      <p className="mt-3 text-xs leading-relaxed text-foreground-tertiary">
        {t('financings.privacyNote')}
      </p>
    </div>
  )
}
