import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { DataTable, type Column } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Avatar } from '@/components/data/Avatar'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { fetchCustomers } from '@/lib/mock/api'
import type { Customer } from '@/lib/mock/data'
import { formatDzd, formatDate, type Locale } from '@/lib/format'

export default function CustomersPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const navigate = useNavigate()
  const [q, setQ] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['customers'], queryFn: fetchCustomers })
  const rows = (data ?? []).filter(
    (c) => !q || c.name.includes(q) || c.phone.includes(q),
  )

  const columns: Column<Customer>[] = [
    {
      key: 'customer',
      header: t('customers.columns.customer'),
      cell: (c) => (
        <div className="flex items-center gap-3">
          <Avatar name={c.name} size={38} />
          <div>
            <p className="font-medium text-foreground">{c.name}</p>
            <p className="text-xs tabular-nums text-foreground-tertiary" dir="ltr">{c.phone}</p>
          </div>
        </div>
      ),
    },
    { key: 'commune', header: t('customers.columns.commune'), cell: (c) => c.commune },
    {
      key: 'purchases',
      header: t('customers.columns.purchases'),
      align: 'center',
      cell: (c) => <span className="tabular-nums">{c.purchaseCount}</span>,
    },
    {
      key: 'total',
      header: t('customers.columns.total'),
      align: 'end',
      cell: (c) => <span className="tabular-nums">{formatDzd(c.totalSpentDzd, locale)}</span>,
    },
    {
      key: 'last',
      header: t('customers.columns.last'),
      align: 'end',
      cell: (c) => <span className="text-foreground-tertiary">{formatDate(c.lastPurchaseAt, locale)}</span>,
    },
    {
      key: 'status',
      header: t('customers.columns.status'),
      align: 'end',
      cell: (c) => <StatusBadge status={c.status} />,
    },
  ]

  return (
    <div className="animate-fade-up">
      <PageHeader title={t('customers.title')} subtitle={t('customers.subtitle')} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('common.search')}
          className="h-9 w-56 rounded-md border border-border-strong bg-background px-3 text-sm focus:border-primary focus:outline-none"
        />
        <span className="ms-auto text-sm text-foreground-tertiary">
          {rows.length} {t('common.results')}
        </span>
      </div>

      <Card>
        {isLoading ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState icon={Users} title={t('common.noResults')} />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(c) => String(c.id)}
            onRowClick={(c) => navigate(`/customers/${c.id}`)}
          />
        )}
      </Card>
    </div>
  )
}
