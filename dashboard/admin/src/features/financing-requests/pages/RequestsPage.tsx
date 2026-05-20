import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { DataTable, type Column } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
import { TierBadge } from '@/components/data/TierBadge'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { fetchRequests } from '@/lib/mock/api'
import type { FinancingRequest } from '@/lib/mock/data'
import { formatDzd, formatDate, type Locale } from '@/lib/format'

const SELECT = 'h-9 rounded-md border border-border-strong bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none'
const STATUS_OPTIONS = [
  'all', 'submitted', 'merchant_confirmed', 'under_review', 'documents_required',
  'contracts_generated', 'contracts_signed', 'approved', 'rejected', 'expired',
]

export default function RequestsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const navigate = useNavigate()
  const [status, setStatus] = useState('all')

  const { data, isLoading } = useQuery({ queryKey: ['requests'], queryFn: fetchRequests })

  const rows = (data ?? []).filter((r) => status === 'all' || r.status === status)

  const columns: Column<FinancingRequest>[] = [
    {
      key: 'reference',
      header: t('requests.columns.reference'),
      cell: (r) => <span className="font-medium tabular-nums text-foreground">{r.reference}</span>,
    },
    {
      key: 'client',
      header: t('requests.columns.client'),
      cell: (r) => (
        <div className="flex items-center gap-2">
          <TierBadge tier={r.clientTier} />
          <span>{r.clientName}</span>
        </div>
      ),
    },
    {
      key: 'merchant',
      header: t('requests.columns.merchant'),
      cell: (r) => (
        <div>
          <p className="text-foreground">{r.merchantName}</p>
          <p className="text-xs text-foreground-tertiary">{t(`source.${r.merchantSource}`)}</p>
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

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={SELECT}>
          {STATUS_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o === 'all' ? t('common.all') : t(`status.${o}`)}
            </option>
          ))}
        </select>
        <span className="ms-auto text-sm text-foreground-tertiary">
          {rows.length} {t('common.results')}
        </span>
      </div>

      <Card>
        {isLoading ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState icon={FileText} title={t('common.noResults')} />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(r) => r.reference}
            onRowClick={(r) => navigate(`/financing-requests/${r.reference}`)}
          />
        )}
      </Card>
    </div>
  )
}
