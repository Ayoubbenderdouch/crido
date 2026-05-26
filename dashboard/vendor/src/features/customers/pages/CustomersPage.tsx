import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Search, Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type Column } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Avatar } from '@/components/data/Avatar'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { cn } from '@/lib/utils'
import { fetchCustomers } from '@/lib/api'
import type { Customer } from '@/lib/mock/data'
import { formatDzd, formatDate, type Locale } from '@/lib/format'

const INPUT =
  'h-11 w-full rounded-xl border border-border-strong bg-background px-3.5 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15'

export default function CustomersPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const navigate = useNavigate()
  const [q, setQ] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['customers'], queryFn: fetchCustomers })
  const all = data ?? []
  const rows = all.filter((c) => !q || c.name.includes(q) || c.phone.includes(q))

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
      <div className="mb-8">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary-surface px-3 py-1 text-xs font-medium text-primary">
          <Users size={14} />
          {t('customers.badge')}
        </div>
        <PageHeader title={t('customers.title')} subtitle={t('customers.subtitle')} />
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search
            size={16}
            className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-foreground-tertiary"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('common.search')}
            className={cn(INPUT, 'ps-10')}
          />
        </div>
        <span className="ms-auto rounded-full bg-background-secondary px-3 py-1 text-sm text-foreground-secondary">
          {rows.length} {t('common.results')}
        </span>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
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
      </section>
    </div>
  )
}
