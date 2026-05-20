import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { cn } from '@/lib/utils'
import { fetchCollections } from '@/lib/mock/api'
import type { CollectionAccount } from '@/lib/mock/data'
import { formatDzd, formatDate, type Locale } from '@/lib/format'

export default function CollectionsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale

  const { data, isLoading } = useQuery({ queryKey: ['collections'], queryFn: fetchCollections })
  const rows = data ?? []

  const columns: Column<CollectionAccount>[] = [
    {
      key: 'financing',
      header: t('collections.columns.financing'),
      cell: (a) => <span className="font-medium tabular-nums text-foreground">{a.financingRef}</span>,
    },
    {
      key: 'customer',
      header: t('collections.columns.customer'),
      cell: (a) => (
        <div>
          <p className="text-foreground">{a.customerName}</p>
          <p className="text-xs tabular-nums text-foreground-tertiary" dir="ltr">{a.customerPhone}</p>
        </div>
      ),
    },
    {
      key: 'daysLate',
      header: t('collections.columns.daysLate'),
      align: 'center',
      cell: (a) => (
        <span className={cn('tabular-nums font-medium', a.daysLate > 30 ? 'text-danger' : 'text-warning')}>
          {a.daysLate} {t('collections.daysUnit')}
        </span>
      ),
    },
    {
      key: 'overdue',
      header: t('collections.columns.overdue'),
      align: 'end',
      cell: (a) => <span className="tabular-nums font-medium text-foreground">{formatDzd(a.overdueDzd, locale)}</span>,
    },
    {
      key: 'lateInstallments',
      header: t('collections.columns.lateInstallments'),
      align: 'center',
      cell: (a) => <span className="tabular-nums">{a.lateInstallments}</span>,
    },
    {
      key: 'lastAction',
      header: t('collections.columns.lastAction'),
      cell: (a) => (
        <div>
          <p className="text-foreground-secondary">{a.lastAction}</p>
          <p className="text-xs text-foreground-tertiary">{formatDate(a.lastActionAt, locale)}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: t('collections.columns.status'),
      cell: (a) => <StatusBadge status={a.status} />,
    },
    {
      key: 'action',
      header: '',
      align: 'end',
      cell: () => (
        <Button size="sm" variant="secondary" onClick={() => toast(t('common.actionDemo'))}>
          {t('collections.logAction')}
        </Button>
      ),
    },
  ]

  return (
    <div className="animate-fade-up">
      <PageHeader title={t('collections.title')} subtitle={t('collections.subtitle')} />
      <Card>
        {isLoading ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState icon={AlertTriangle} title={t('common.noResults')} />
        ) : (
          <DataTable columns={columns} rows={rows} rowKey={(a) => a.financingRef} />
        )}
      </Card>
    </div>
  )
}
