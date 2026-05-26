import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Users, CreditCard, Banknote, TrendingUp, PhoneCall, ChevronLeft } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { KpiCard } from '@/components/data/KpiCard'
import { StatusBadge } from '@/components/data/StatusBadge'
import { DataTable, type Column } from '@/components/data/DataTable'
import { Loader } from '@/components/data/Loader'
import { Avatar } from '@/components/data/Avatar'
import { AreaTrend } from '@/components/charts/AreaTrend'
import { BarTrend } from '@/components/charts/BarTrend'
import { DonutChart } from '@/components/charts/DonutChart'
import { fetchDashboard } from '@/lib/mock/api'
import { getFinancingRequests } from '@/lib/adminRequestStore'
import { clients, currentAdmin, type FinancingRequest } from '@/lib/mock/data'
import { formatDzd, formatNumber, formatDate, type Locale } from '@/lib/format'
import { TimeRangePicker } from '@/components/data/TimeRangePicker'
import {
  barPointsForRange,
  chartPointsForRange,
  computeTrendPct,
  filterByRange,
  formatChartAxisLabel,
  loadStoredTimeRange,
  sumNumeric,
  type TimeRangeId,
} from '@/lib/timeRange'

const TODAY = '2026-05-20'

function QueueRow({ avatar, title, subtitle, onClick }: {
  avatar: React.ReactNode
  title: string
  subtitle: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-border px-5 py-3 text-start transition-colors last:border-0 hover:bg-background-secondary"
    >
      {avatar}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">{title}</span>
        <span className="block truncate text-xs text-foreground-tertiary">{subtitle}</span>
      </span>
      <ChevronLeft size={16} className="shrink-0 text-foreground-tertiary ltr:rotate-180" />
    </button>
  )
}

export default function DashboardPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const navigate = useNavigate()
  const [range, setRange] = useState<TimeRangeId>(loadStoredTimeRange)

  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboard })

  const periodStats = useMemo(() => {
    if (!data) return null
    const filtered = filterByRange(data.daily, range)
    const revenueValues = filtered.map((d) => d.revenueDzd)
    const financingValues = filtered.map((d) => d.financings)
    return {
      filtered,
      periodRevenue: sumNumeric(filtered, 'revenueDzd'),
      revenueTrend: computeTrendPct(revenueValues),
      revenueSpark: revenueValues.length > 24 ? revenueValues.slice(-24) : revenueValues,
      financingTrend: computeTrendPct(financingValues),
      financingSpark: financingValues.length > 24 ? financingValues.slice(-24) : financingValues,
      areaPoints: chartPointsForRange(data.daily, range, ['revenueDzd']),
      barPoints: barPointsForRange(data.daily, range, 'financings').map((p) => ({
        label: p.label,
        financings: p.value,
      })),
    }
  }, [data, range])

  if (isLoading || !data || !periodStats) return <Loader />

  const { kpis } = data
  const firstName = currentAdmin.name.split(' ')[0]
  const allRequests = getFinancingRequests()
  const recent = allRequests.slice(0, 5)
  const pendingKyc = clients.filter((c) => c.kycStatus === 'pending')
  const adHoc = allRequests.filter(
    (r) => r.merchantSource === 'ad_hoc' && r.status === 'submitted',
  )

  const slices = data.portfolio.map((p) => ({
    name: t(`status.${p.name}`),
    value: p.value,
    color: p.color,
  }))
  const totalFinancings = slices.reduce((sum, s) => sum + s.value, 0)
  const periodLabel = t(`timeRange.${range}`)
  const axisFmt = (v: string) => formatChartAxisLabel(v, range)

  const recentColumns: Column<FinancingRequest>[] = [
    {
      key: 'reference',
      header: t('requests.columns.reference'),
      cell: (r) => <span className="font-medium tabular-nums text-foreground">{r.reference}</span>,
    },
    { key: 'client', header: t('requests.columns.client'), cell: (r) => r.clientName },
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t('dashboard.stats.activeClients')}
          value={formatNumber(kpis.activeClients, locale)}
          icon={Users}
          trend={kpis.kycPending > 0 ? 12 : 8}
          spark={data.sparks.clients}
        />
        <KpiCard
          label={t('dashboard.stats.activeFinancings')}
          value={formatNumber(kpis.activeFinancings, locale)}
          icon={CreditCard}
          trend={periodStats.financingTrend}
          spark={periodStats.financingSpark}
        />
        <KpiCard
          label={t('dashboard.stats.pendingVerification')}
          value={formatNumber(kpis.pendingVerification, locale)}
          icon={Banknote}
          accent="warning"
          spark={data.sparks.payments}
          sparkColor="#EF9F27"
        />
        <KpiCard
          label={t('timeRange.kpiRevenue', { period: periodLabel })}
          value={formatDzd(periodStats.periodRevenue, locale)}
          icon={TrendingUp}
          trend={periodStats.revenueTrend}
          spark={periodStats.revenueSpark}
          sparkColor="#1D9E75"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden p-0 lg:col-span-2">
          <div className="flex flex-col gap-3 border-b border-border bg-gradient-to-r from-primary-surface/70 to-transparent px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {t('dashboard.charts.revenue')}
              </p>
              <p className="mt-0.5 text-xs text-foreground-tertiary">
                {t('timeRange.chartHint', { period: periodLabel })} ·{' '}
                <span className="font-medium text-primary">
                  {formatDzd(periodStats.periodRevenue, locale)}
                </span>
              </p>
            </div>
            <TimeRangePicker value={range} onChange={setRange} compact />
          </div>
          <div className="p-5">
            <AreaTrend
              data={periodStats.areaPoints}
              dataKey="revenueDzd"
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
          <p className="text-md font-medium text-foreground">{t('dashboard.portfolio')}</p>
          <div className="mt-2">
            <DonutChart
              data={slices}
              centerValue={formatNumber(totalFinancings, locale)}
              centerLabel={t('nav.financings')}
            />
          </div>
          <div className="mt-4 space-y-2.5">
            {slices.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-foreground-secondary">{s.name}</span>
                <span className="ms-auto tabular-nums font-medium text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-border bg-gradient-to-r from-primary-surface/70 to-transparent px-5 py-4">
            <p className="text-sm font-semibold text-foreground">{t('dashboard.weekly')}</p>
            <p className="mt-0.5 text-xs text-foreground-tertiary">
              {t('timeRange.chartHint', { period: periodLabel })}
            </p>
          </div>
          <div className="p-5">
            <BarTrend
              data={periodStats.barPoints}
              dataKey="financings"
              xKey="label"
              color="#0F6E56"
              height={220}
            />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('dashboard.recentRequests')}</CardTitle>
            <button
              type="button"
              onClick={() => navigate('/financing-requests')}
              className="text-sm text-primary hover:underline"
            >
              {t('common.viewAll')}
            </button>
          </CardHeader>
          <DataTable
            columns={recentColumns}
            rows={recent}
            rowKey={(r) => r.reference}
            onRowClick={(r) => navigate(`/financing-requests/${r.reference}`)}
          />
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{t('dashboard.pendingKyc')}</CardTitle></CardHeader>
          {pendingKyc.map((c) => (
            <QueueRow
              key={c.id}
              avatar={<Avatar name={c.name} size={36} />}
              title={c.name}
              subtitle={c.commune}
              onClick={() => navigate(`/clients/${c.id}`)}
            />
          ))}
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('dashboard.adHoc')}</CardTitle></CardHeader>
          {adHoc.map((r) => (
            <QueueRow
              key={r.reference}
              avatar={
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-surface text-primary">
                  <PhoneCall size={15} strokeWidth={1.75} />
                </span>
              }
              title={r.merchantName}
              subtitle={`${r.clientName} · ${formatDzd(r.amountDzd, locale)}`}
              onClick={() => navigate(`/financing-requests/${r.reference}`)}
            />
          ))}
        </Card>
      </div>
    </div>
  )
}
