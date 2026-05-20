import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Send } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { DataTable, type Column } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { cn } from '@/lib/utils'
import { fetchMerchantPayouts } from '@/lib/mock/api'
import type { MerchantPayout } from '@/lib/mock/data'
import { formatDzd, formatDate, type Locale } from '@/lib/format'

const TABS = ['all', 'pending', 'processing', 'paid'] as const

export default function PayoutsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const [tab, setTab] = useState<(typeof TABS)[number]>('all')

  const { data, isLoading } = useQuery({ queryKey: ['merchant-payouts'], queryFn: fetchMerchantPayouts })
  const all = data ?? []
  const rows = all.filter((p) => tab === 'all' || p.status === tab)
  const countOf = (s: string) => all.filter((p) => p.status === s).length

  const columns: Column<MerchantPayout>[] = [
    {
      key: 'reference',
      header: t('payouts.columns.reference'),
      cell: (p) => <span className="font-medium tabular-nums text-foreground">{p.reference}</span>,
    },
    {
      key: 'merchant',
      header: t('payouts.columns.merchant'),
      cell: (p) => (
        <div>
          <p className="text-foreground">{p.merchantName}</p>
          <p className="text-xs text-foreground-tertiary">{p.customerName}</p>
        </div>
      ),
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
      cell: (p) => <span className="text-foreground-tertiary">{formatDate(p.createdAt, locale)}</span>,
    },
  ]

  return (
    <div className="animate-fade-up">
      <PageHeader title={t('payouts.title')} subtitle={t('payouts.subtitle')} />

      <div className="mb-4 flex flex-wrap gap-1 border-b border-border">
        {TABS.map((tb) => {
          const count = tb === 'all' ? all.length : countOf(tb)
          return (
            <button
              key={tb}
              type="button"
              onClick={() => setTab(tb)}
              className={cn(
                '-mb-px flex items-center gap-2 border-b-2 px-4 py-2 text-sm transition-colors',
                tab === tb
                  ? 'border-primary font-medium text-primary'
                  : 'border-transparent text-foreground-secondary hover:text-foreground',
              )}
            >
              {t(`payouts.tabs.${tb}`)}
              {count > 0 ? (
                <span
                  className={cn(
                    'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium',
                    tab === tb ? 'bg-primary text-primary-fg' : 'bg-background-secondary text-foreground-tertiary',
                  )}
                >
                  {count}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      <Card>
        {isLoading ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState icon={Send} title={t('common.noResults')} />
        ) : (
          <DataTable columns={columns} rows={rows} rowKey={(p) => p.reference} />
        )}
      </Card>
    </div>
  )
}
