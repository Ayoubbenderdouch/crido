import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Store } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { DataTable, type Column } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { fetchMerchants } from '@/lib/mock/api'
import type { Merchant } from '@/lib/mock/data'
import { formatDzd, type Locale } from '@/lib/format'
import { cn } from '@/lib/utils'

const TABS = ['all', 'partner', 'ad_hoc'] as const

export default function MerchantsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const [tab, setTab] = useState<(typeof TABS)[number]>('all')

  const { data, isLoading } = useQuery({ queryKey: ['merchants'], queryFn: fetchMerchants })

  const rows = (data ?? []).filter((m) => tab === 'all' || m.source === tab)

  const columns: Column<Merchant>[] = [
    {
      key: 'merchant',
      header: t('merchants.columns.merchant'),
      cell: (m) => (
        <div>
          <p className="font-medium text-foreground">{m.name}</p>
          <p className="text-xs text-foreground-tertiary">{m.commune}</p>
        </div>
      ),
    },
    {
      key: 'source',
      header: t('merchants.columns.source'),
      cell: (m) => (
        <span className="rounded-sm bg-background-secondary px-2 py-0.5 text-xs text-foreground-secondary">
          {t(`source.${m.source}`)}
        </span>
      ),
    },
    {
      key: 'phone',
      header: t('merchants.columns.phone'),
      cell: (m) => <span className="tabular-nums text-foreground-secondary" dir="ltr">{m.phone}</span>,
    },
    {
      key: 'sales',
      header: t('merchants.columns.sales'),
      align: 'end',
      cell: (m) => <span className="tabular-nums">{formatDzd(m.totalSalesDzd, locale)}</span>,
    },
    {
      key: 'financings',
      header: t('merchants.columns.financings'),
      align: 'center',
      cell: (m) => <span className="tabular-nums">{m.totalFinancings}</span>,
    },
    {
      key: 'status',
      header: t('merchants.columns.status'),
      align: 'end',
      cell: (m) => <StatusBadge status={m.status} />,
    },
  ]

  return (
    <div className="animate-fade-up">
      <PageHeader title={t('merchants.title')} subtitle={t('merchants.subtitle')} />

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
            {tb === 'all' ? t('common.all') : t(`source.${tb}`)}
          </button>
        ))}
      </div>

      <Card>
        {isLoading ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState icon={Store} title={t('common.noResults')} />
        ) : (
          <DataTable columns={columns} rows={rows} rowKey={(m) => String(m.id)} />
        )}
      </Card>
    </div>
  )
}
