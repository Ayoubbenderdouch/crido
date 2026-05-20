import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { CreditCard } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { DataTable, type Column } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { cn } from '@/lib/utils'
import { fetchFinancings } from '@/lib/mock/api'
import type { Financing } from '@/lib/mock/data'
import { formatDzd, formatDate, type Locale } from '@/lib/format'

const TABS = ['all', 'active', 'completed'] as const

export default function FinancingsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const [tab, setTab] = useState<(typeof TABS)[number]>('all')

  const { data, isLoading } = useQuery({ queryKey: ['financings'], queryFn: fetchFinancings })
  const rows = (data ?? []).filter((f) => tab === 'all' || f.status === tab)

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

      <div className="mb-4 flex gap-1 border-b border-border">
        {TABS.map((tb) => (
          <button
            key={tb}
            type="button"
            onClick={() => setTab(tb)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2 text-sm transition-colors',
              tab === tb
                ? 'border-primary font-medium text-primary'
                : 'border-transparent text-foreground-secondary hover:text-foreground',
            )}
          >
            {t(`financings.tabs.${tb}`)}
          </button>
        ))}
      </div>

      <Card>
        {isLoading ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState icon={CreditCard} title={t('common.noResults')} />
        ) : (
          <DataTable columns={columns} rows={rows} rowKey={(f) => f.reference} />
        )}
      </Card>

      <p className="mt-3 text-xs leading-relaxed text-foreground-tertiary">
        {t('financings.privacyNote')}
      </p>
    </div>
  )
}
