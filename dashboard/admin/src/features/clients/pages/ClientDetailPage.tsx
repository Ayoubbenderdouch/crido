import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ChevronRight, IdCard, Camera, UserX } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/data/StatusBadge'
import { TierBadge } from '@/components/data/TierBadge'
import { DataTable, type Column } from '@/components/data/DataTable'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { cn } from '@/lib/utils'
import { fetchClient } from '@/lib/mock/api'
import { financings, type Client, type Financing } from '@/lib/mock/data'
import { formatDzd, formatDate, type Locale } from '@/lib/format'

const TABS = ['overview', 'kyc', 'financings', 'credit'] as const
type Tab = (typeof TABS)[number]

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
      <span className="text-sm text-foreground-tertiary">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

export default function ClientDetailPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const { id } = useParams()
  const [tab, setTab] = useState<Tab>('overview')

  const { data: c, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: () => fetchClient(Number(id)),
  })

  if (isLoading) return <Loader />
  if (!c) {
    return (
      <div className="animate-fade-up">
        <Card><EmptyState icon={UserX} title={t('common.notFound')} /></Card>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      <Link
        to="/clients"
        className="mb-3 inline-flex items-center gap-1 text-sm text-foreground-tertiary transition-colors hover:text-foreground"
      >
        <ChevronRight size={16} className="ltr:rotate-180" />
        {t('clients.title')}
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-surface text-lg font-medium text-primary">
          {c.name.charAt(0)}
        </span>
        <div className="me-auto">
          <h1 className="text-xl font-medium text-foreground">{c.name}</h1>
          <p className="text-sm tabular-nums text-foreground-tertiary" dir="ltr">{c.phone}</p>
        </div>
        <TierBadge tier={c.tier} />
        <StatusBadge status={c.kycStatus} />
      </div>

      <div className="mb-4 flex gap-1 border-b border-border">
        {TABS.map((tb) => (
          <button
            key={tb}
            type="button"
            onClick={() => setTab(tb)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2 text-sm transition-colors',
              tab === tb
                ? 'border-primary font-medium text-primary'
                : 'border-transparent text-foreground-secondary hover:text-foreground',
            )}
          >
            {t(`clients.tabs.${tb}`)}
          </button>
        ))}
      </div>

      {tab === 'overview' ? <OverviewTab client={c} locale={locale} /> : null}
      {tab === 'kyc' ? <KycTab kycStatus={c.kycStatus} /> : null}
      {tab === 'financings' ? <FinancingsTab name={c.name} locale={locale} /> : null}
      {tab === 'credit' ? <CreditTab client={c} locale={locale} /> : null}
    </div>
  )
}

function OverviewTab({ client: c, locale }: { client: Client; locale: Locale }) {
  const { t } = useTranslation()
  return (
    <Card className="px-5">
      <Field label={t('clients.fields.phone')} value={<span dir="ltr">{c.phone}</span>} />
      <Field label={t('clients.fields.dob')} value={formatDate(c.dateOfBirth, locale)} />
      <Field label={t('clients.fields.address')} value={c.address} />
      <Field label={t('clients.columns.commune')} value={c.commune} />
      <Field label={t('clients.fields.employment')} value={t(`employment.${c.employmentStatus}`)} />
      <Field label={t('clients.fields.employer')} value={c.employer ?? '—'} />
      <Field
        label={t('clients.fields.income')}
        value={c.monthlyIncomeDzd ? formatDzd(c.monthlyIncomeDzd, locale) : '—'}
      />
    </Card>
  )
}

function KycTab({ kycStatus }: { kycStatus: string }) {
  const { t } = useTranslation()
  const demo = () => toast(t('common.actionDemo'))
  const docs = [
    { key: 'idFront', icon: IdCard },
    { key: 'idBack', icon: IdCard },
    { key: 'selfie', icon: Camera },
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('kyc.docsTitle')}</CardTitle>
        <StatusBadge status={kycStatus} />
      </CardHeader>
      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
        {docs.map((d) => (
          <div
            key={d.key}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong bg-background-secondary text-foreground-tertiary"
          >
            <d.icon size={28} strokeWidth={1.5} />
            <span className="px-2 text-center text-xs">{t(`kyc.${d.key}`)}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
        <Button variant="ghost" size="sm" onClick={demo}>{t('kyc.rejectKyc')}</Button>
        <Button size="sm" onClick={demo}>{t('kyc.approveKyc')}</Button>
      </div>
    </Card>
  )
}

function FinancingsTab({ name, locale }: { name: string; locale: Locale }) {
  const { t } = useTranslation()
  const rows = financings.filter((f) => f.clientName === name)

  const columns: Column<Financing>[] = [
    {
      key: 'reference',
      header: t('financings.columns.reference'),
      cell: (f) => <span className="font-medium tabular-nums">{f.reference}</span>,
    },
    { key: 'product', header: t('requests.columns.product'), cell: (f) => f.productName },
    {
      key: 'remaining',
      header: t('financings.columns.remaining'),
      align: 'end',
      cell: (f) => <span className="tabular-nums">{formatDzd(f.remainingDzd, locale)}</span>,
    },
    {
      key: 'status',
      header: t('financings.columns.status'),
      align: 'end',
      cell: (f) => <StatusBadge status={f.status} />,
    },
  ]

  return (
    <Card>
      {rows.length === 0 ? (
        <EmptyState icon={UserX} title={t('common.noResults')} />
      ) : (
        <DataTable columns={columns} rows={rows} rowKey={(f) => f.reference} />
      )}
    </Card>
  )
}

function CreditTab({ client: c, locale }: { client: Client; locale: Locale }) {
  const { t } = useTranslation()
  const available = Math.max(0, c.creditLimitDzd - c.usedCreditDzd)
  const usedPct = c.creditLimitDzd > 0 ? (c.usedCreditDzd / c.creditLimitDzd) * 100 : 0

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="flex flex-col items-center justify-center p-6 text-center">
        <p className="text-sm text-foreground-tertiary">{t('clients.fields.score')}</p>
        <p className="mt-1 text-3xl font-medium tabular-nums text-primary">{c.creditScore}</p>
        <div className="mt-3"><TierBadge tier={c.tier} /></div>
      </Card>

      <Card className="p-5 lg:col-span-2">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-foreground-tertiary">{t('clients.fields.used')}</span>
          <span className="tabular-nums font-medium">
            {formatDzd(c.usedCreditDzd, locale)} / {formatDzd(c.creditLimitDzd, locale)}
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-background-secondary">
          <div className="h-full rounded-full bg-primary" style={{ width: `${usedPct}%` }} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-md bg-background-secondary px-4 py-3">
            <p className="text-xs text-foreground-tertiary">{t('clients.fields.limit')}</p>
            <p className="mt-1 tabular-nums font-medium">{formatDzd(c.creditLimitDzd, locale)}</p>
          </div>
          <div className="rounded-md bg-primary-surface px-4 py-3">
            <p className="text-xs text-primary">{t('clients.fields.available')}</p>
            <p className="mt-1 tabular-nums font-medium text-primary">{formatDzd(available, locale)}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
