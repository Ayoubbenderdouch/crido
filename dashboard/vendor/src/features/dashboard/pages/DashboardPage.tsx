import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { TrendingUp, CreditCard, ClipboardList, Wallet, ChevronLeft } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { KpiCard } from '@/components/data/KpiCard'
import { StatusBadge } from '@/components/data/StatusBadge'
import { DataTable, type Column } from '@/components/data/DataTable'
import { Loader } from '@/components/data/Loader'
import { AreaTrend } from '@/components/charts/AreaTrend'
import { BarTrend } from '@/components/charts/BarTrend'
import { DonutChart } from '@/components/charts/DonutChart'
import { fetchDashboard } from '@/lib/mock/api'
import { currentUser, financings, payouts, type Financing, type Payout } from '@/lib/mock/data'
import { formatDzd, formatNumber, formatDate, type Locale } from '@/lib/format'

const TODAY = '2026-05-20'
const shortDate = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`

export default function DashboardPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboard })

  if (isLoading || !data) return <Loader />

  const { kpis, trends, sparks } = data
  const firstName = currentUser.name.split(' ')[0]

  const topProducts = data.topProducts.map((p) => ({ name: p.name, value: p.value }))
  const durationSlices = data.duration.map((d) => ({
    name: `${d.name} ${t('dashboard.months')}`,
    value: d.value,
    color: d.color,
  }))
  const totalDuration = durationSlices.reduce((sum, s) => sum + s.value, 0)

  const recentFinancings = financings.slice(0, 4)
  const recentPayouts = payouts.slice(0, 4)

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
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-foreground">
          {t('dashboard.greeting', { name: firstName })}
        </h1>
        <p className="mt-1 text-sm text-foreground-secondary">
          {t('dashboard.subtitle')} · {formatDate(TODAY, locale)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t('dashboard.stats.monthSales')}
          value={formatDzd(kpis.monthSalesDzd, locale)}
          icon={TrendingUp}
          trend={trends.sales}
          spark={sparks.sales}
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
        <Card className="p-5 lg:col-span-2">
          <p className="text-md font-medium text-foreground">{t('dashboard.charts.sales')}</p>
          <div className="mt-4">
            <AreaTrend
              data={data.daily}
              dataKey="salesDzd"
              xKey="date"
              color="#0F6E56"
              xTickFormatter={shortDate}
              yTickFormatter={(v) => `${Math.round(v / 1000)}k`}
              valueFormatter={(v) => formatDzd(v, locale)}
              labelFormatter={shortDate}
            />
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-md font-medium text-foreground">{t('dashboard.charts.duration')}</p>
          <div className="mt-2">
            <DonutChart
              data={durationSlices}
              centerValue={formatNumber(totalDuration, locale)}
              centerLabel={t('nav.financings')}
            />
          </div>
          <div className="mt-4 space-y-2.5">
            {durationSlices.map((s) => (
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
        <Card className="p-5">
          <p className="text-md font-medium text-foreground">{t('dashboard.charts.topProducts')}</p>
          <div className="mt-4">
            <BarTrend data={topProducts} dataKey="value" xKey="name" color="#0F6E56" height={232} />
          </div>
        </Card>

        <Card className="lg:col-span-2">
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
        <Card>
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
