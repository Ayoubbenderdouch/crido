import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { CreditCard } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { DataTable, type Column } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { fetchFinancings } from '@/lib/mock/api'
import type { Financing } from '@/lib/mock/data'
import { formatDzd, formatDate, type Locale } from '@/lib/format'

export default function FinancingsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale

  const { data, isLoading } = useQuery({ queryKey: ['financings'], queryFn: fetchFinancings })
  const rows = data ?? []

  const columns: Column<Financing>[] = [
    {
      key: 'reference',
      header: t('financings.columns.reference'),
      cell: (f) => <span className="font-medium tabular-nums text-foreground">{f.reference}</span>,
    },
    { key: 'client', header: t('financings.columns.client'), cell: (f) => f.clientName },
    {
      key: 'merchant',
      header: t('financings.columns.merchant'),
      cell: (f) => <span className="text-foreground-secondary">{f.merchantName}</span>,
    },
    {
      key: 'progress',
      header: t('financings.columns.progress'),
      cell: (f) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-background-secondary">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(f.paidInstallments / f.durationMonths) * 100}%` }}
            />
          </div>
          <span className="text-xs tabular-nums text-foreground-tertiary">
            {f.paidInstallments}/{f.durationMonths}
          </span>
        </div>
      ),
    },
    {
      key: 'remaining',
      header: t('financings.columns.remaining'),
      align: 'end',
      cell: (f) => <span className="tabular-nums">{formatDzd(f.remainingDzd, locale)}</span>,
    },
    {
      key: 'nextDue',
      header: t('financings.columns.nextDue'),
      align: 'end',
      cell: (f) => <span className="text-foreground-tertiary">{formatDate(f.nextDueDate, locale)}</span>,
    },
    {
      key: 'status',
      header: t('financings.columns.status'),
      align: 'end',
      cell: (f) => <StatusBadge status={f.status} />,
    },
  ]

  return (
    <div className="animate-fade-up">
      <PageHeader title={t('financings.title')} subtitle={t('financings.subtitle')} />
      <Card>
        {isLoading ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState icon={CreditCard} title={t('common.noResults')} />
        ) : (
          <DataTable columns={columns} rows={rows} rowKey={(f) => f.reference} />
        )}
      </Card>
    </div>
  )
}
