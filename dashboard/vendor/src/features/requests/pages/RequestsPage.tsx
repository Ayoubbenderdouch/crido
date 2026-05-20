import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ClipboardList } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { DataTable, type Column } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Avatar } from '@/components/data/Avatar'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { cn } from '@/lib/utils'
import { fetchRequests } from '@/lib/mock/api'
import { merchantProfile, type IncomingRequest, type RequestStatus } from '@/lib/mock/data'
import { formatDzd, formatDate, type Locale } from '@/lib/format'

const TABS: { key: string; status: RequestStatus | 'all' }[] = [
  { key: 'new', status: 'submitted' },
  { key: 'confirmed', status: 'merchant_confirmed' },
  { key: 'approved', status: 'approved' },
  { key: 'rejected', status: 'merchant_rejected' },
]

export function payoutOf(amount: number): number {
  return amount - Math.round((amount * merchantProfile.commissionRate) / 100)
}

export default function RequestsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const navigate = useNavigate()
  const [tab, setTab] = useState<string>('new')

  const { data, isLoading } = useQuery({ queryKey: ['requests'], queryFn: fetchRequests })
  const all = data ?? []

  const active = TABS.find((tb) => tb.key === tab) ?? TABS[0]
  const rows = all.filter((r) => r.status === active.status)
  const countOf = (status: RequestStatus) => all.filter((r) => r.status === status).length

  const columns: Column<IncomingRequest>[] = [
    {
      key: 'reference',
      header: t('requests.columns.reference'),
      cell: (r) => <span className="font-medium tabular-nums text-foreground">{r.reference}</span>,
    },
    {
      key: 'customer',
      header: t('requests.columns.customer'),
      cell: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.customerName} size={38} />
          <div>
            <p className="text-foreground">{r.customerName}</p>
            <p className="text-xs tabular-nums text-foreground-tertiary" dir="ltr">{r.customerPhone}</p>
          </div>
        </div>
      ),
    },
    { key: 'product', header: t('requests.columns.product'), cell: (r) => r.productName },
    {
      key: 'plan',
      header: t('requests.columns.plan'),
      cell: (r) => t('requests.months', { count: r.planMonths }),
    },
    {
      key: 'amount',
      header: t('requests.columns.amount'),
      align: 'end',
      cell: (r) => <span className="tabular-nums">{formatDzd(r.amountDzd, locale)}</span>,
    },
    {
      key: 'payout',
      header: t('requests.columns.payout'),
      align: 'end',
      cell: (r) => (
        <span className="tabular-nums font-medium text-primary">
          {formatDzd(payoutOf(r.amountDzd), locale)}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('requests.columns.status'),
      align: 'end',
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'date',
      header: t('requests.columns.date'),
      align: 'end',
      cell: (r) => <span className="text-foreground-tertiary">{formatDate(r.createdAt, locale)}</span>,
    },
  ]

  return (
    <div className="animate-fade-up">
      <PageHeader title={t('requests.title')} subtitle={t('requests.subtitle')} />

      <div className="mb-4 flex flex-wrap gap-1 border-b border-border">
        {TABS.map((tb) => {
          const count = countOf(tb.status as RequestStatus)
          return (
            <button
              key={tb.key}
              type="button"
              onClick={() => setTab(tb.key)}
              className={cn(
                '-mb-px flex items-center gap-2 border-b-2 px-4 py-2 text-sm transition-colors',
                tab === tb.key
                  ? 'border-primary font-medium text-primary'
                  : 'border-transparent text-foreground-secondary hover:text-foreground',
              )}
            >
              {t(`requests.tabs.${tb.key}`)}
              {count > 0 ? (
                <span
                  className={cn(
                    'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium',
                    tab === tb.key
                      ? 'bg-primary text-primary-fg'
                      : 'bg-background-secondary text-foreground-tertiary',
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
          <EmptyState icon={ClipboardList} title={t('common.noResults')} />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(r) => r.reference}
            onRowClick={(r) => navigate(`/requests/${r.reference}`)}
          />
        )}
      </Card>
    </div>
  )
}
