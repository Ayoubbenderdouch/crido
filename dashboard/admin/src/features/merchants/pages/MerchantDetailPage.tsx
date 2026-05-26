import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  ChevronRight,
  Store,
  Phone,
  Mail,
  Globe,
  MapPin,
  Package,
  Users,
  Building2,
  Percent,
  Wallet,
  TrendingUp,
  CreditCard,
  ClipboardList,
} from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { KpiCard } from '@/components/data/KpiCard'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Avatar } from '@/components/data/Avatar'
import { DataTable, type Column } from '@/components/data/DataTable'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { TimeRangePicker } from '@/components/data/TimeRangePicker'
import { AreaTrend } from '@/components/charts/AreaTrend'
import { cn } from '@/lib/utils'
import { fetchMerchant } from '@/lib/mock/api'
import {
  buildMerchantSalesSeries,
  financings,
  financingRequests,
  merchantPayouts,
  type Financing,
  type FinancingRequest,
  type MerchantPayout,
} from '@/lib/mock/data'
import { formatDzd, formatDate, formatTenure, type Locale } from '@/lib/format'
import {
  chartPointsForRange,
  computeTrendPct,
  filterByRange,
  formatChartAxisLabel,
  loadStoredTimeRange,
  sumNumeric,
  type TimeRangeId,
} from '@/lib/timeRange'

const TABS = ['overview', 'financings', 'payouts', 'requests'] as const
type Tab = (typeof TABS)[number]

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
      <span className="text-sm text-foreground-tertiary">{label}</span>
      <span className="text-end text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function merchantFinancings(name: string): Financing[] {
  return financings.filter((f) => f.merchantName === name)
}

function merchantRequests(name: string): FinancingRequest[] {
  return financingRequests.filter(
    (r) => r.merchantName === name || r.merchantName.startsWith(name),
  )
}

function merchantPayoutsFor(name: string): MerchantPayout[] {
  return merchantPayouts.filter((p) => p.merchantName === name)
}

export default function MerchantDetailPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const navigate = useNavigate()
  const { id } = useParams()
  const [tab, setTab] = useState<Tab>('overview')
  const [range, setRange] = useState<TimeRangeId>(loadStoredTimeRange)

  const { data: m, isLoading } = useQuery({
    queryKey: ['merchant', id],
    queryFn: () => fetchMerchant(Number(id)),
  })

  const salesSeries = useMemo(
    () => (m ? buildMerchantSalesSeries(m.id) : []),
    [m],
  )

  const periodStats = useMemo(() => {
    if (!m || salesSeries.length === 0) return null
    const filtered = filterByRange(salesSeries, range)
    const values = filtered.map((d) => d.salesDzd)
    return {
      periodSales: sumNumeric(filtered, 'salesDzd'),
      salesTrend: computeTrendPct(values),
      areaPoints: chartPointsForRange(salesSeries, range, ['salesDzd']),
    }
  }, [m, salesSeries, range])

  if (isLoading) return <Loader />
  if (!m) {
    return (
      <div className="animate-fade-up">
        <Card><EmptyState icon={Store} title={t('common.notFound')} /></Card>
      </div>
    )
  }

  const periodLabel = t(`timeRange.${range}`)
  const axisFmt = (v: string) => formatChartAxisLabel(v, range)
  const tenure = formatTenure(m.joinedAt, locale)
  const finRows = merchantFinancings(m.name)
  const payRows = merchantPayoutsFor(m.name)
  const reqRows = merchantRequests(m.name)

  return (
    <div className="animate-fade-up">
      <Link
        to="/merchants"
        className="mb-3 inline-flex items-center gap-1 text-sm text-foreground-tertiary transition-colors hover:text-foreground"
      >
        <ChevronRight size={16} className="ltr:rotate-180" />
        {t('merchants.title')}
      </Link>

      <section className="mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="bg-gradient-to-br from-primary-surface via-background to-background px-6 py-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <Avatar name={m.name} size={64} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-medium text-foreground">{m.name}</h1>
                <StatusBadge status={m.status} />
                <span className="rounded-md bg-background-secondary px-2 py-0.5 text-xs font-medium text-foreground-secondary">
                  {t(`source.${m.source}`)}
                </span>
              </div>
              {m.tagline ? (
                <p className="mt-1 text-sm text-foreground-secondary">{m.tagline}</p>
              ) : null}
              {m.nameFr ? (
                <p className="mt-0.5 text-xs text-foreground-tertiary" dir="ltr">{m.nameFr}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-foreground-secondary">
                <a
                  href={`tel:${m.phone}`}
                  className="inline-flex items-center gap-1.5 hover:text-primary"
                  dir="ltr"
                >
                  <Phone size={14} />
                  {m.phone}
                </a>
                {m.email ? (
                  <a
                    href={`mailto:${m.email}`}
                    className="inline-flex items-center gap-1.5 hover:text-primary"
                    dir="ltr"
                  >
                    <Mail size={14} />
                    {m.email}
                  </a>
                ) : null}
                {m.website ? (
                  <span className="inline-flex items-center gap-1.5" dir="ltr">
                    <Globe size={14} />
                    {m.website}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="shrink-0 rounded-xl border border-primary/15 bg-primary-surface/60 px-4 py-3 text-center">
              <p className="text-xs text-foreground-tertiary">{t('merchants.detail.withUs')}</p>
              <p className="mt-1 text-lg font-semibold text-primary">{tenure}</p>
              <p className="mt-1 text-xs text-foreground-tertiary">
                {t('merchants.detail.since', { date: formatDate(m.joinedAt, locale) })}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t('merchants.detail.stats.totalSales')}
          value={formatDzd(m.totalSalesDzd, locale)}
          icon={TrendingUp}
          trend={periodStats?.salesTrend}
          spark={periodStats?.areaPoints.map((p) => Number(p.salesDzd)).slice(-12)}
        />
        <KpiCard
          label={t('merchants.detail.stats.financings')}
          value={String(m.totalFinancings)}
          icon={CreditCard}
        />
        <KpiCard
          label={t('timeRange.kpiRevenue', { period: t('merchants.detail.stats.month') })}
          value={formatDzd(m.monthSalesDzd, locale)}
          icon={Wallet}
        />
        <KpiCard
          label={t('merchants.detail.stats.pendingPayout')}
          value={formatDzd(m.pendingPayoutDzd, locale)}
          icon={Wallet}
          accent={m.pendingPayoutDzd > 0 ? 'warning' : 'default'}
        />
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
            {t(`merchants.detail.tabs.${tb}`)}
          </button>
        ))}
      </div>

      {tab === 'overview' && periodStats ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="overflow-hidden p-0 lg:col-span-2">
            <div className="flex flex-col gap-3 border-b border-border bg-gradient-to-r from-primary-surface/70 to-transparent px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {t('merchants.detail.salesChart')}
                </p>
                <p className="mt-0.5 text-xs text-foreground-tertiary">
                  {t('timeRange.chartHint', { period: periodLabel })} ·{' '}
                  <span className="font-medium text-primary">
                    {formatDzd(periodStats.periodSales, locale)}
                  </span>
                </p>
              </div>
              <TimeRangePicker value={range} onChange={setRange} compact />
            </div>
            <div className="p-5">
              <AreaTrend
                data={periodStats.areaPoints}
                dataKey="salesDzd"
                xKey="date"
                color="#0F6E56"
                xTickFormatter={axisFmt}
                yTickFormatter={(v) => `${Math.round(v / 1000)}k`}
                valueFormatter={(v) => formatDzd(v, locale)}
                labelFormatter={axisFmt}
                height={260}
              />
            </div>
          </Card>

          <Card className="p-5">
            <CardHeader className="mb-0 px-0 pt-0">
              <CardTitle>{t('merchants.detail.profile')}</CardTitle>
            </CardHeader>
            {m.description ? (
              <p className="mb-4 text-sm leading-relaxed text-foreground-secondary">{m.description}</p>
            ) : null}
            <Field label={t('merchants.detail.fields.category')} value={m.category} />
            <Field label={t('merchants.detail.fields.wilaya')} value={`${m.commune} · ${m.wilaya}`} />
            <Field
              label={t('merchants.detail.fields.address')}
              value={
                <span className="flex items-start gap-1.5">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />
                  {m.address}
                </span>
              }
            />
            <Field
              label={t('merchants.detail.fields.commission')}
              value={`${m.commissionRate}%`}
            />
            <Field
              label={t('merchants.detail.fields.lastActivity')}
              value={formatDate(m.lastActivityAt, locale)}
            />
            {m.rc ? <Field label={t('merchants.detail.fields.rc')} value={<span dir="ltr">{m.rc}</span>} /> : null}
            {m.nif ? <Field label={t('merchants.detail.fields.nif')} value={<span dir="ltr">{m.nif}</span>} /> : null}
          </Card>

          <Card className="p-5 lg:col-span-3">
            <p className="mb-4 text-sm font-semibold text-foreground">
              {t('merchants.detail.operations')}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: Building2, label: t('merchants.detail.fields.branches'), value: m.branchesCount },
                { icon: Package, label: t('merchants.detail.fields.products'), value: m.productsCount },
                { icon: Users, label: t('merchants.detail.fields.staff'), value: m.staffCount },
                { icon: Percent, label: t('merchants.detail.fields.commission'), value: `${m.commissionRate}%` },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-border bg-background-secondary/50 px-4 py-3"
                >
                  <item.icon size={18} className="text-primary" strokeWidth={1.5} />
                  <p className="mt-2 text-xs text-foreground-tertiary">{item.label}</p>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}

      {tab === 'financings' ? (
        <FinancingsTab rows={finRows} locale={locale} navigate={navigate} />
      ) : null}
      {tab === 'payouts' ? (
        <PayoutsTab rows={payRows} locale={locale} navigate={navigate} />
      ) : null}
      {tab === 'requests' ? (
        <RequestsTab rows={reqRows} locale={locale} navigate={navigate} />
      ) : null}
    </div>
  )
}

function FinancingsTab({
  rows,
  locale,
  navigate,
}: {
  rows: Financing[]
  locale: Locale
  navigate: (path: string) => void
}) {
  const { t } = useTranslation()
  const columns: Column<Financing>[] = [
    {
      key: 'reference',
      header: t('financings.columns.reference'),
      cell: (f) => <span className="font-medium tabular-nums">{f.reference}</span>,
    },
    { key: 'client', header: t('requests.columns.client'), cell: (f) => f.clientName },
    { key: 'product', header: t('requests.columns.product'), cell: (f) => f.productName },
    {
      key: 'total',
      header: t('requests.columns.amount'),
      align: 'end',
      cell: (f) => formatDzd(f.totalToCollectDzd, locale),
    },
    {
      key: 'status',
      header: t('requests.columns.status'),
      align: 'end',
      cell: (f) => <StatusBadge status={f.status} />,
    },
  ]

  return (
    <Card>
      {rows.length === 0 ? (
        <EmptyState icon={CreditCard} title={t('common.noResults')} />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(f) => f.reference}
          onRowClick={() => navigate('/financings')}
        />
      )}
    </Card>
  )
}

function PayoutsTab({
  rows,
  locale,
  navigate,
}: {
  rows: MerchantPayout[]
  locale: Locale
  navigate: (path: string) => void
}) {
  const { t } = useTranslation()
  const columns: Column<MerchantPayout>[] = [
    {
      key: 'reference',
      header: t('payouts.columns.reference'),
      cell: (p) => <span className="font-medium tabular-nums">{p.reference}</span>,
    },
    { key: 'client', header: t('requests.columns.client'), cell: (p) => p.customerName },
    {
      key: 'amount',
      header: t('payouts.columns.amount'),
      align: 'end',
      cell: (p) => formatDzd(p.amountDzd, locale),
    },
    {
      key: 'status',
      header: t('payouts.columns.status'),
      align: 'end',
      cell: (p) => <StatusBadge status={p.status} />,
    },
  ]

  return (
    <Card>
      {rows.length === 0 ? (
        <EmptyState icon={Wallet} title={t('common.noResults')} />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(p) => p.reference}
          onRowClick={(row) => navigate(`/payouts/${row.reference}`)}
        />
      )}
    </Card>
  )
}

function RequestsTab({
  rows,
  locale,
  navigate,
}: {
  rows: FinancingRequest[]
  locale: Locale
  navigate: (path: string) => void
}) {
  const { t } = useTranslation()
  const columns: Column<FinancingRequest>[] = [
    {
      key: 'reference',
      header: t('requests.columns.reference'),
      cell: (r) => <span className="font-medium tabular-nums">{r.reference}</span>,
    },
    { key: 'client', header: t('requests.columns.client'), cell: (r) => r.clientName },
    { key: 'product', header: t('requests.columns.product'), cell: (r) => r.productName },
    {
      key: 'amount',
      header: t('requests.columns.amount'),
      align: 'end',
      cell: (r) => formatDzd(r.amountDzd, locale),
    },
    {
      key: 'status',
      header: t('requests.columns.status'),
      align: 'end',
      cell: (r) => <StatusBadge status={r.status} />,
    },
  ]

  return (
    <Card>
      {rows.length === 0 ? (
        <EmptyState icon={ClipboardList} title={t('common.noResults')} />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.reference}
          onRowClick={(r) => navigate(`/financing-requests/${r.reference}`)}
        />
      )}
    </Card>
  )
}
