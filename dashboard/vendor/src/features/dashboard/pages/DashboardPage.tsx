import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { TrendingUp, CreditCard, ClipboardList, Wallet, ChevronLeft, Target, ArrowLeft } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { KpiCard } from '@/components/data/KpiCard'
import { StatusBadge } from '@/components/data/StatusBadge'
import { DataTable, type Column } from '@/components/data/DataTable'
import { Loader } from '@/components/data/Loader'
import { AreaTrend } from '@/components/charts/AreaTrend'
import { DonutChart } from '@/components/charts/DonutChart'
import { fetchDashboard, fetchFinancings, fetchPayouts } from '@/lib/api'
import { currentUser, type Financing, type Payout } from '@/lib/mock/data'
import { formatDzd, formatNumber, formatDate, type Locale } from '@/lib/format'
import { useVendorStore } from '@/hooks/useVendorStore'
import { cn } from '@/lib/utils'
import { TimeRangePicker } from '@/components/data/TimeRangePicker'
import {
  chartPointsForRange,
  computeTrendPct,
  filterByRange,
  formatChartAxisLabel,
  loadStoredTimeRange,
  sumNumeric,
  type TimeRangeId,
} from '@/lib/timeRange'

const TODAY = '2026-05-20'

function ProgressRing({ percent, size = 128 }: { percent: number; size?: number }) {
  const stroke = 11
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(Math.max(percent, 0), 100)
  const offset = circumference - (clamped / 100) * circumference

  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="text-white transition-[stroke-dashoffset] duration-700 ease-out"
      />
    </svg>
  )
}

export default function DashboardPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const navigate = useNavigate()
  const store = useVendorStore()

  const [range, setRange] = useState<TimeRangeId>(loadStoredTimeRange)
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboard })
  const { data: financingsData } = useQuery({ queryKey: ['financings'], queryFn: () => fetchFinancings() })
  const { data: payoutsData } = useQuery({ queryKey: ['payouts'], queryFn: () => fetchPayouts() })

  const periodStats = useMemo(() => {
    if (!data) return null
    const filtered = filterByRange(data.daily, range)
    const salesValues = filtered.map((d) => d.salesDzd)
    return {
      periodSales: sumNumeric(filtered, 'salesDzd'),
      salesTrend: computeTrendPct(salesValues),
      salesSpark: salesValues.length > 24 ? salesValues.slice(-24) : salesValues,
      areaPoints: chartPointsForRange(data.daily, range, ['salesDzd']),
    }
  }, [data, range])

  if (isLoading || !data || !periodStats) return <Loader />

  const { kpis, trends, sparks } = data
  const periodLabel = t(`timeRange.${range}`)
  const axisFmt = (v: string) => formatChartAxisLabel(v, range)
  const firstName = currentUser.name.split(' ')[0]

  const topProducts = data.topProducts.map((p) => ({ name: p.name, value: p.value }))
  const maxProduct = Math.max(...topProducts.map((p) => p.value), 1)
  const durationSlices = data.duration.map((d) => ({
    name: `${d.name} ${t('dashboard.months')}`,
    value: d.value,
    color: d.color,
  }))
  const totalDuration = durationSlices.reduce((sum, s) => sum + s.value, 0)

  const recentFinancings = (financingsData ?? []).slice(0, 4)
  const recentPayouts = (payoutsData ?? []).slice(0, 4)

  const monthlyGoalDzd = kpis.monthlyGoalDzd
  const goalPercent = Math.round((kpis.monthSalesDzd / monthlyGoalDzd) * 100)
  const goalClamped = Math.min(goalPercent, 100)
  const remainingDzd = Math.max(monthlyGoalDzd - kpis.monthSalesDzd, 0)
  const pendingCount = store.requests.filter((r) => r.status === 'submitted').length

  const financingColumns: Column<Financing>[] = [
    {
      key: 'reference',
      header: t('financings.columns.reference'),
      cell: (f) => <span className="font-medium tabular-nums text-foreground">{f.reference}</span>,
    },
    { key: 'customer', header: t('financings.columns.customer'), cell: (f) => f.customerName },
    {
      key: 'payout',
      header: t('financings.columns.payout'),
      align: 'end',
      cell: (f) => <span className="tabular-nums">{formatDzd(f.payoutDzd, locale)}</span>,
    },
    {
      key: 'status',
      header: t('financings.columns.status'),
      align: 'end',
      cell: (f) => <StatusBadge status={f.status} />,
    },
  ]

  const payoutColumns: Column<Payout>[] = [
    {
      key: 'reference',
      header: t('payouts.columns.reference'),
      cell: (p) => <span className="font-medium tabular-nums text-foreground">{p.reference}</span>,
    },
    {
      key: 'amount',
      header: t('payouts.columns.amount'),
      align: 'end',
      cell: (p) => <span className="tabular-nums">{formatDzd(p.amountDzd, locale)}</span>,
    },
    {
      key: 'status',
      header: t('payouts.columns.status'),
      align: 'end',
      cell: (p) => <StatusBadge status={p.status} />,
    },
  ]

  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">
            {t('dashboard.greeting', { name: firstName })}
          </h1>
          <p className="mt-1 text-sm text-foreground-secondary">
            {t('dashboard.subtitle')} · {formatDate(TODAY, locale)}
          </p>
        </div>
        <TimeRangePicker value={range} onChange={setRange} />
      </div>

      <section className="relative mb-6 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary via-primary-hover to-[#084A3A] p-6 text-primary-fg shadow-md">
        <div
          className="pointer-events-none absolute -end-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -start-10 h-48 w-48 rounded-full bg-primary-light/25 blur-3xl"
          aria-hidden
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative mx-auto shrink-0 sm:mx-0">
              <ProgressRing percent={goalClamped} />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-semibold tabular-nums leading-none">{goalClamped}%</span>
                <span className="mt-1 text-xs font-medium text-white/80">{t('dashboard.goal.achieved')}</span>
              </div>
            </div>

            <div className="min-w-0 text-center sm:text-start">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <Target size={14} />
                {t('dashboard.goal.title')}
              </div>
              <p className="text-sm text-white/85">{t('dashboard.goal.subtitle')}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur-sm">
                  <p className="text-xs text-white/70">{t('dashboard.goal.target')}</p>
                  <p className="mt-0.5 font-semibold tabular-nums">{formatDzd(monthlyGoalDzd, locale)}</p>
                </div>
                <div className="rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur-sm">
                  <p className="text-xs text-white/70">{t('dashboard.stats.monthSales')}</p>
                  <p className="mt-0.5 font-semibold tabular-nums">{formatDzd(kpis.monthSalesDzd, locale)}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-white/75">
                {remainingDzd === 0
                  ? t('dashboard.goal.complete')
                  : t('dashboard.goal.remaining', { amount: formatDzd(remainingDzd, locale) })}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-end">
            {pendingCount > 0 ? (
              <button
                type="button"
                onClick={() => navigate('/requests')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-warning px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:brightness-105"
              >
                <ClipboardList size={16} />
                {t('dashboard.goal.pendingBadge', { count: pendingCount })}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => navigate('/requests')}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-medium backdrop-blur-sm transition hover:bg-white/20',
                pendingCount === 0 && 'w-full sm:w-auto',
              )}
            >
              {t('dashboard.goal.viewRequests')}
              <ArrowLeft size={16} className="ltr:rotate-180" />
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t('timeRange.kpiSales', { period: periodLabel })}
          value={formatDzd(periodStats.periodSales, locale)}
          icon={TrendingUp}
          trend={periodStats.salesTrend}
          spark={periodStats.salesSpark}
        />
        <KpiCard
          label={t('dashboard.stats.totalFinancings')}
          value={formatNumber(kpis.totalFinancings, locale)}
          icon={CreditCard}
          trend={trends.financings}
          spark={sparks.financings}
          sparkColor="#1D9E75"
        />
        <KpiCard
          label={t('dashboard.stats.pendingRequests')}
          value={formatNumber(kpis.pendingRequests, locale)}
          icon={ClipboardList}
          accent="warning"
          spark={sparks.requests}
          sparkColor="#EF9F27"
        />
        <KpiCard
          label={t('dashboard.stats.pendingPayout')}
          value={formatDzd(kpis.pendingPayoutDzd, locale)}
          icon={Wallet}
          trend={trends.payout}
          spark={sparks.payout}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden p-0 lg:col-span-2">
          <div className="flex flex-col gap-3 border-b border-border bg-gradient-to-r from-primary-surface/80 to-transparent px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">{t('dashboard.charts.sales')}</p>
              <p className="mt-0.5 text-xs text-foreground-tertiary">
                {t('timeRange.chartHint', { period: periodLabel })} ·{' '}
                <span className="font-medium text-primary">
                  {formatDzd(periodStats.periodSales, locale)}
                </span>
              </p>
            </div>
            <TimeRangePicker value={range} onChange={setRange} compact />
          </div>
          <div className="p-5 pt-4">
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

        <Card className="overflow-hidden p-0">
          <div className="border-b border-border bg-gradient-to-r from-primary-surface/80 to-transparent px-5 py-4">
            <p className="text-sm font-semibold text-foreground">{t('dashboard.charts.duration')}</p>
          </div>
          <div className="p-5 pt-4">
            <DonutChart
              data={durationSlices}
              centerValue={formatNumber(totalDuration, locale)}
              centerLabel={t('nav.financings')}
            />
            <div className="mt-4 space-y-2.5">
              {durationSlices.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-foreground-secondary">{s.name}</span>
                  <span className="ms-auto tabular-nums font-medium text-foreground">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-border bg-gradient-to-r from-primary-surface/80 to-transparent px-5 py-4">
            <p className="text-sm font-semibold text-foreground">{t('dashboard.charts.topProducts')}</p>
          </div>
          <div className="space-y-4 p-5 pt-4">
            {topProducts.map((p) => (
              <div key={p.name}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-foreground">{p.name}</span>
                  <span className="shrink-0 tabular-nums text-foreground-tertiary">{p.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-background-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(p.value / maxProduct) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('dashboard.recentFinancings')}</CardTitle>
            <button
              type="button"
              onClick={() => navigate('/financings')}
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              {t('common.viewAll')}
              <ChevronLeft size={15} className="ltr:rotate-180" />
            </button>
          </CardHeader>
          <DataTable
            columns={financingColumns}
            rows={recentFinancings}
            rowKey={(f) => f.reference}
            onRowClick={(f) => navigate(`/financings/${f.reference}`)}
          />
        </Card>
      </div>

      <div className="mt-4">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>{t('dashboard.recentPayouts')}</CardTitle>
            <button
              type="button"
              onClick={() => navigate('/payouts')}
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              {t('common.viewAll')}
              <ChevronLeft size={15} className="ltr:rotate-180" />
            </button>
          </CardHeader>
          <DataTable
            columns={payoutColumns}
            rows={recentPayouts}
            rowKey={(p) => p.reference}
            onRowClick={(p) => navigate(`/payouts/${p.reference}`)}
          />
        </Card>
      </div>
    </div>
  )
}
