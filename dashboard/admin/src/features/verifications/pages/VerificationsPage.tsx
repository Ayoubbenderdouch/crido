import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { PhoneCall } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/data/DataTable'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { fetchVerifications } from '@/lib/mock/api'
import type { VerificationItem } from '@/lib/mock/data'
import { formatDzd, formatDate, type Locale } from '@/lib/format'

export default function VerificationsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale

  const { data, isLoading } = useQuery({ queryKey: ['verifications'], queryFn: fetchVerifications })
  const rows = data ?? []

  const columns: Column<VerificationItem>[] = [
    {
      key: 'request',
      header: t('verifications.columns.request'),
      cell: (v) => <span className="font-medium tabular-nums text-foreground">{v.requestRef}</span>,
    },
    {
      key: 'merchant',
      header: t('verifications.columns.merchant'),
      cell: (v) => (
        <div>
          <p className="text-foreground">{v.proposedMerchantName}</p>
          <p className="text-xs text-foreground-tertiary">{v.proposedMerchantAddress}</p>
        </div>
      ),
    },
    {
      key: 'client',
      header: t('verifications.columns.client'),
      cell: (v) => (
        <div>
          <p className="text-foreground">{v.clientName}</p>
          <p className="text-xs tabular-nums text-foreground-tertiary" dir="ltr">{v.clientPhone}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: t('verifications.columns.amount'),
      align: 'end',
      cell: (v) => <span className="tabular-nums">{formatDzd(v.amountDzd, locale)}</span>,
    },
    {
      key: 'date',
      header: t('verifications.columns.date'),
      align: 'end',
      cell: (v) => <span className="text-foreground-tertiary">{formatDate(v.submittedAt, locale)}</span>,
    },
    {
      key: 'call',
      header: t('verifications.columns.phone'),
      align: 'end',
      cell: (v) => (
        <a href={`tel:${v.proposedMerchantPhone}`} onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="secondary">
            <PhoneCall size={15} />
            {t('verifications.callNow')}
          </Button>
        </a>
      ),
    },
  ]

  return (
    <div className="animate-fade-up">
      <PageHeader title={t('verifications.title')} subtitle={t('verifications.subtitle')} />
      <Card>
        {isLoading ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState icon={PhoneCall} title={t('common.noResults')} />
        ) : (
          <DataTable columns={columns} rows={rows} rowKey={(v) => v.requestRef} />
        )}
      </Card>
    </div>
  )
}
