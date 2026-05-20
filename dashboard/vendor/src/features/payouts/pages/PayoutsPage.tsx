import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Wallet } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { DataTable, type Column } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { cn } from '@/lib/utils'
import { fetchPayouts } from '@/lib/mock/api'
import type { Payout } from '@/lib/mock/data'
import { formatDzd, formatDate, type Locale } from '@/lib/format'

const TABS = ['all', 'pending', 'paid'] as const

export default function PayoutsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const navigate = useNavigate()
  const [tab, setTab] = useState<(typeof TABS)[number]>('all')

  const { data, isLoading } = useQuery({ queryKey: ['payouts'], queryFn: fetchPayouts })
  const rows = (data ?? []).filter((p) => {
    if (tab === 'all') return true
    if (tab === 'paid') return p.status === 'paid'
    return p.status !== 'paid'
  })

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
      <PageHeader title={t('payouts.title')} subtitle={t('payouts.subtitle')} />

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
            {t(`payouts.tabs.${tb}`)}
          </button>
        ))}
      </div>

      <Card>
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
      </Card>
    </div>
  )
}
