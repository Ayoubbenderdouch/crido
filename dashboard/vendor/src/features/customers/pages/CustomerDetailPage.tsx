import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ChevronRight, UserX, User, ShoppingBag, FileText, Shield } from 'lucide-react'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Avatar } from '@/components/data/Avatar'
import { DataTable, type Column } from '@/components/data/DataTable'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { fetchCustomer } from '@/lib/api'
import { financings, type Financing } from '@/lib/mock/data'
import { formatDzd, formatDate, type Locale } from '@/lib/format'

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-3.5 last:border-0">
      <span className="text-sm text-foreground-tertiary">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-gradient-to-r from-primary-surface/80 to-transparent px-5 py-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon size={18} className="text-primary" />
          {title}
        </h2>
      </div>
      <div className="px-5 py-1">{children}</div>
    </section>
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
        <section className="rounded-2xl border border-border bg-card shadow-sm">
          <EmptyState icon={UserX} title={t('common.notFound')} />
        </section>
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
        className="mb-4 inline-flex items-center gap-1 text-sm text-foreground-tertiary transition hover:text-primary"
      >
        <ChevronRight size={16} className="ltr:rotate-180" />
        {t('customers.title')}
      </Link>

      <div className="mb-8 flex flex-wrap items-center gap-4">
        <Avatar name={c.name} size={56} />
        <div className="me-auto min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{c.name}</h1>
          <p className="mt-0.5 text-sm tabular-nums text-foreground-tertiary" dir="ltr">
            {c.phone}
          </p>
        </div>
        <StatusBadge status={c.status} />
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary-surface/60 to-card px-4 py-4 shadow-sm">
          <p className="text-xs text-foreground-tertiary">{t('customers.fields.purchases')}</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{c.purchaseCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm sm:col-span-2">
          <p className="text-xs text-foreground-tertiary">{t('customers.fields.total')}</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-primary">
            {formatDzd(c.totalSpentDzd, locale)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard icon={User} title={t('customers.sections.profile')}>
          <DetailRow label={t('customers.fields.phone')} value={<span dir="ltr">{c.phone}</span>} />
          <DetailRow label={t('customers.fields.commune')} value={c.commune} />
          <DetailRow label={t('customers.fields.first')} value={formatDate(c.firstPurchaseAt, locale)} />
          <DetailRow label={t('customers.fields.last')} value={formatDate(c.lastPurchaseAt, locale)} />
        </SectionCard>

        <div className="space-y-4 lg:col-span-2">
          <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border bg-gradient-to-r from-primary-surface/80 to-transparent px-5 py-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileText size={18} className="text-primary" />
                {t('customers.financingsTitle')}
              </h2>
            </div>
            {theirFinancings.length === 0 ? (
              <EmptyState icon={ShoppingBag} title={t('common.noResults')} />
            ) : (
              <DataTable columns={columns} rows={theirFinancings} rowKey={(f) => f.reference} />
            )}
          </section>

          <div className="flex gap-3 rounded-2xl border border-border/80 bg-background-secondary/40 px-4 py-3.5">
            <Shield size={16} className="mt-0.5 shrink-0 text-primary" />
            <p className="text-xs leading-relaxed text-foreground-tertiary">{t('customers.privacyNote')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
