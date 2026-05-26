import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  ChevronRight,
  User,
  Store,
  Package,
  Wallet,
  TrendingUp,
  FileX,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/data/StatusBadge'
import { TierBadge } from '@/components/data/TierBadge'
import { Avatar } from '@/components/data/Avatar'
import { DataTable, type Column } from '@/components/data/DataTable'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { fetchFinancingContext } from '@/lib/mock/api'
import type { InstallmentRow } from '@/lib/mock/api'
import type { Payment } from '@/lib/mock/data'
import { clientHref, findClientByName, findMerchantByName, merchantHref } from '@/lib/financingLookup'
import { formatDzd, formatDate, daysBetween, type Locale } from '@/lib/format'
import { cn } from '@/lib/utils'

const ANCHOR = '2026-05-20'

function ProgressRing({ pct, status }: { pct: number; status: string }) {
  const stroke = status === 'late' ? '#EF9F27' : status === 'defaulted' ? '#E24B4A' : '#0F6E56'
  const size = 88
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(pct, 100) / 100) * circ

  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={8} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
      />
    </svg>
  )
}

export default function FinancingDetailPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const { reference } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ['financing-context', reference],
    queryFn: () => fetchFinancingContext(reference ?? ''),
  })

  if (isLoading) return <Loader />
  if (!data) {
    return (
      <Card>
        <EmptyState icon={FileX} title={t('common.notFound')} />
      </Card>
    )
  }

  const { financing: f, installments, payments } = data
  const client = findClientByName(f.clientName)
  const merchant = findMerchantByName(f.merchantName)
  const paidPct = Math.round((f.paidAmountDzd / f.totalToCollectDzd) * 100)
  const instPct = Math.round((f.paidInstallments / f.durationMonths) * 100)
  const daysToDue = daysBetween(ANCHOR, f.nextDueDate)
  const mHref = merchantHref(f.merchantName)
  const cHref = clientHref(f.clientName)

  const installmentColumns: Column<InstallmentRow>[] = [
    {
      key: 'num',
      header: '#',
      cell: (row) => <span className="tabular-nums">{row.number}</span>,
    },
    {
      key: 'due',
      header: t('financings.detail.dueDate'),
      cell: (row) => formatDate(row.dueDate, locale),
    },
    {
      key: 'amount',
      header: t('financings.detail.amount'),
      align: 'end',
      cell: (row) => formatDzd(row.amountDzd, locale),
    },
    {
      key: 'status',
      header: t('financings.columns.status'),
      align: 'end',
      cell: (row) => (
        <span className="text-xs font-medium text-foreground-secondary">
          {t(`financings.installmentStatus.${row.status}`)}
        </span>
      ),
    },
  ]

  const paymentColumns: Column<Payment>[] = [
    {
      key: 'ref',
      header: t('payments.columns.reference'),
      cell: (p) => <span className="font-medium tabular-nums">{p.reference}</span>,
    },
    {
      key: 'amount',
      header: t('payments.columns.amount'),
      align: 'end',
      cell: (p) => formatDzd(p.amountDzd, locale),
    },
    {
      key: 'method',
      header: t('payments.columns.method'),
      cell: (p) => t(`method.${p.method}`),
    },
    {
      key: 'status',
      header: t('payments.columns.status'),
      align: 'end',
      cell: (p) => <StatusBadge status={p.status} />,
    },
  ]

  return (
    <div className="animate-fade-up">
      <Link
        to="/financings"
        className="mb-3 inline-flex items-center gap-1 text-sm text-foreground-tertiary hover:text-foreground"
      >
        <ChevronRight size={16} className="ltr:rotate-180" />
        {t('financings.title')}
      </Link>

      <section className="mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="bg-gradient-to-br from-primary-surface/80 via-background to-background px-6 py-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="relative mx-auto shrink-0 lg:mx-0">
              <ProgressRing pct={instPct} status={f.status} />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-semibold tabular-nums">{instPct}%</span>
                <span className="text-[10px] text-foreground-tertiary">{t('financings.detail.paid')}</span>
              </div>
            </div>
            <div className="min-w-0 flex-1 text-center lg:text-start">
              <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                <h1 className="text-xl font-medium tabular-nums text-foreground">{f.reference}</h1>
                <StatusBadge status={f.status} />
              </div>
              <p className="mt-1 text-sm text-foreground-secondary">{f.productName}</p>
              <p className="mt-2 text-xs text-foreground-tertiary">
                {t('financings.detail.activated', { date: formatDate(f.activatedAt, locale) })}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:max-w-md">
              <div className="rounded-xl border border-border bg-background/80 px-3 py-2.5 text-center">
                <p className="text-xs text-foreground-tertiary">{t('financings.detail.total')}</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums">{formatDzd(f.totalToCollectDzd, locale)}</p>
              </div>
              <div className="rounded-xl border border-border bg-background/80 px-3 py-2.5 text-center">
                <p className="text-xs text-foreground-tertiary">{t('financings.columns.remaining')}</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-primary">
                  {formatDzd(f.remainingDzd, locale)}
                </p>
              </div>
              <div
                className={cn(
                  'col-span-2 rounded-xl border px-3 py-2.5 text-center sm:col-span-1',
                  f.status === 'late' && 'border-warning/40 bg-warning/10',
                  f.status === 'defaulted' && 'border-danger/30 bg-danger/10',
                )}
              >
                <p className="text-xs text-foreground-tertiary">{t('financings.columns.nextDue')}</p>
                <p className="mt-0.5 text-sm font-semibold">{formatDate(f.nextDueDate, locale)}</p>
                {f.status === 'late' ? (
                  <p className="text-xs text-warning">
                    {t('financings.detail.daysLate', { days: Math.abs(daysToDue) })}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-border bg-info/5 px-5 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <User size={16} className="text-info" />
              {t('financings.detail.clientCard')}
            </h2>
          </div>
          <div className="flex items-center gap-4 p-5">
            <Avatar name={f.clientName} size={48} />
            <div className="min-w-0 flex-1">
              {cHref ? (
                <Link to={cHref} className="font-semibold text-foreground hover:text-primary hover:underline">
                  {f.clientName}
                </Link>
              ) : (
                <p className="font-semibold">{f.clientName}</p>
              )}
              {client ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <TierBadge tier={client.tier} />
                  <StatusBadge status={client.kycStatus} />
                  <span className="text-xs text-foreground-tertiary">
                    {t('requests.profile.creditScore')}: {client.creditScore}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="border-b border-border bg-primary-surface/50 px-5 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Store size={16} className="text-primary" />
              {t('financings.detail.merchantCard')}
            </h2>
          </div>
          <div className="flex items-center gap-4 p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-surface text-primary">
              <Store size={22} />
            </span>
            <div className="min-w-0 flex-1">
              {mHref ? (
                <Link to={mHref} className="font-semibold text-foreground hover:text-primary hover:underline">
                  {f.merchantName}
                </Link>
              ) : (
                <p className="font-semibold">{f.merchantName}</p>
              )}
              {merchant ? (
                <p className="mt-1 text-xs text-foreground-tertiary">
                  {merchant.commune} · {merchant.totalFinancings} {t('financings.detail.financingCount')}
                </p>
              ) : null}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Package size={16} className="text-primary" />
            {t('financings.detail.installments')}
          </h2>
          <DataTable
            columns={installmentColumns}
            rows={installments}
            rowKey={(r) => String(r.number)}
          />
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Wallet size={16} className="text-primary" />
            {t('financings.detail.payments')}
          </h2>
          {payments.length === 0 ? (
            <p className="py-8 text-center text-sm text-foreground-tertiary">{t('common.noResults')}</p>
          ) : (
            <DataTable columns={paymentColumns} rows={payments} rowKey={(p) => p.reference} />
          )}
        </Card>
      </div>

      <Card className="mt-4 p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <TrendingUp size={16} className="text-primary" />
          {t('financings.detail.summary')}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-background-secondary/60 px-4 py-3">
            <p className="text-xs text-foreground-tertiary">{t('financings.detail.monthly')}</p>
            <p className="mt-1 font-semibold tabular-nums">{formatDzd(f.monthlyInstallmentDzd, locale)}</p>
          </div>
          <div className="rounded-lg bg-background-secondary/60 px-4 py-3">
            <p className="text-xs text-foreground-tertiary">{t('financings.detail.collected')}</p>
            <p className="mt-1 font-semibold tabular-nums text-success">{formatDzd(f.paidAmountDzd, locale)}</p>
            <p className="text-xs text-foreground-tertiary">{paidPct}%</p>
          </div>
          <div className="rounded-lg bg-background-secondary/60 px-4 py-3">
            <p className="text-xs text-foreground-tertiary">{t('financings.columns.progress')}</p>
            <p className="mt-1 font-semibold tabular-nums">
              {f.paidInstallments}/{f.durationMonths} {t('financings.detail.installmentsUnit')}
            </p>
          </div>
          <div className="rounded-lg bg-background-secondary/60 px-4 py-3">
            <p className="text-xs text-foreground-tertiary">{t('financings.detail.plan')}</p>
            <p className="mt-1 font-semibold">{t('requests.months', { count: f.durationMonths })}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
