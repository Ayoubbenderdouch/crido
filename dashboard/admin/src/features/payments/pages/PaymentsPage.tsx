import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Banknote } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { DataTable, type Column } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { Button } from '@/components/ui/button'
import { fetchPayments } from '@/lib/mock/api'
import type { Payment } from '@/lib/mock/data'
import { formatDzd, formatDate, type Locale } from '@/lib/format'

export default function PaymentsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale

  const { data, isLoading } = useQuery({ queryKey: ['payments'], queryFn: fetchPayments })
  const rows = data ?? []

  const columns: Column<Payment>[] = [
    {
      key: 'reference',
      header: t('payments.columns.reference'),
      cell: (p) => <span className="font-medium tabular-nums text-foreground">{p.reference}</span>,
    },
    { key: 'client', header: t('payments.columns.client'), cell: (p) => p.clientName },
    {
      key: 'financing',
      header: t('payments.columns.financing'),
      cell: (p) => <span className="tabular-nums text-foreground-secondary">{p.financingRef}</span>,
    },
    {
      key: 'amount',
      header: t('payments.columns.amount'),
      align: 'end',
      cell: (p) => <span className="tabular-nums">{formatDzd(p.amountDzd, locale)}</span>,
    },
    {
      key: 'method',
      header: t('payments.columns.method'),
      cell: (p) => t(`method.${p.method}`),
    },
    {
      key: 'externalRef',
      header: t('payments.columns.externalRef'),
      cell: (p) => <span className="tabular-nums text-foreground-tertiary">{p.externalRef}</span>,
    },
    {
      key: 'status',
      header: t('payments.columns.status'),
      align: 'end',
      cell: (p) =>
        p.status === 'pending_verification' ? (
          <div className="flex items-center justify-end gap-2">
            <Button size="sm" variant="secondary">{t('common.approve')}</Button>
            <Button size="sm" variant="ghost">{t('common.reject')}</Button>
          </div>
        ) : (
          <StatusBadge status={p.status} />
        ),
    },
  ]

  const dateColumn: Column<Payment> = {
    key: 'date',
    header: t('requests.columns.date'),
    align: 'end',
    cell: (p) => <span className="text-foreground-tertiary">{formatDate(p.submittedAt, locale)}</span>,
  }

  return (
    <div className="animate-fade-up">
      <PageHeader title={t('payments.title')} subtitle={t('payments.subtitle')} />
      <Card>
        {isLoading ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState icon={Banknote} title={t('common.noResults')} />
        ) : (
          <DataTable
            columns={[...columns.slice(0, 6), dateColumn, columns[6]]}
            rows={rows}
            rowKey={(p) => p.reference}
          />
        )}
      </Card>
    </div>
  )
}
