import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ChevronRight, UserX } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/data/StatusBadge'
import { DataTable, type Column } from '@/components/data/DataTable'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { fetchCustomer } from '@/lib/mock/api'
import { financings, type Financing } from '@/lib/mock/data'
import { formatDzd, formatDate, type Locale } from '@/lib/format'

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
      <span className="text-sm text-foreground-tertiary">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

export default function CustomerDetailPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const { id } = useParams()

  const { data: c, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => fetchCustomer(Number(id)),
  })

  if (isLoading) return <Loader />
  if (!c) {
    return (
      <div className="animate-fade-up">
        <Card><EmptyState icon={UserX} title={t('common.notFound')} /></Card>
      </div>
    )
  }

  const theirFinancings = financings.filter((f) => f.customerName === c.name)

  const columns: Column<Financing>[] = [
    {
      key: 'reference',
      header: t('financings.columns.reference'),
      cell: (f) => <span className="font-medium tabular-nums">{f.reference}</span>,
    },
    { key: 'product', header: t('financings.columns.product'), cell: (f) => f.productName },
    {
      key: 'total',
      header: t('financings.columns.total'),
      align: 'end',
      cell: (f) => <span className="tabular-nums">{formatDzd(f.totalAmountDzd, locale)}</span>,
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
      <Link
        to="/customers"
        className="mb-3 inline-flex items-center gap-1 text-sm text-foreground-tertiary transition-colors hover:text-foreground"
      >
        <ChevronRight size={16} className="ltr:rotate-180" />
        {t('customers.title')}
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-surface text-lg font-medium text-primary">
          {c.name.charAt(0)}
        </span>
        <div className="me-auto">
          <h1 className="text-xl font-medium text-foreground">{c.name}</h1>
          <p className="text-sm tabular-nums text-foreground-tertiary" dir="ltr">{c.phone}</p>
        </div>
        <StatusBadge status={c.status} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="px-5 lg:col-span-1">
          <Field label={t('customers.fields.phone')} value={<span dir="ltr">{c.phone}</span>} />
          <Field label={t('customers.fields.commune')} value={c.commune} />
          <Field label={t('customers.fields.purchases')} value={c.purchaseCount} />
          <Field label={t('customers.fields.total')} value={formatDzd(c.totalSpentDzd, locale)} />
          <Field label={t('customers.fields.first')} value={formatDate(c.firstPurchaseAt, locale)} />
          <Field label={t('customers.fields.last')} value={formatDate(c.lastPurchaseAt, locale)} />
        </Card>

        <div className="space-y-3 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>{t('customers.financingsTitle')}</CardTitle></CardHeader>
            {theirFinancings.length === 0 ? (
              <EmptyState icon={UserX} title={t('common.noResults')} />
            ) : (
              <DataTable columns={columns} rows={theirFinancings} rowKey={(f) => f.reference} />
            )}
          </Card>
          <p className="text-xs leading-relaxed text-foreground-tertiary">
            {t('customers.privacyNote')}
          </p>
        </div>
      </div>
    </div>
  )
}
