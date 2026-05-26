import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Banknote, Send, TrendingUp, AlertTriangle, Download } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { KpiCard } from '@/components/data/KpiCard'
import { Loader } from '@/components/data/Loader'
import { AreaTrend } from '@/components/charts/AreaTrend'
import { BarTrend } from '@/components/charts/BarTrend'
import { DonutChart } from '@/components/charts/DonutChart'
import { fetchDashboard } from '@/lib/mock/api'
import { financings, merchantPayouts } from '@/lib/mock/data'
import { formatDzd, type Locale } from '@/lib/format'
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

export default function ReportsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const [range, setRange] = useState<TimeRangeId>(loadStoredTimeRange)

  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboard })

  const periodStats = useMemo(() => {
    if (!data) return null
    const filtered = filterByRange(data.daily, range)
    const revenueValues = filtered.map((d) => d.revenueDzd)
    return {
      periodRevenue: sumNumeric(filtered, 'revenueDzd'),
      revenueTrend: computeTrendPct(revenueValues),
      areaPoints: chartPointsForRange(data.daily, range, ['revenueDzd']),
      barPoints: barPointsForRange(data.daily, range, 'financings').map((p) => ({
        label: p.label,
        financings: p.value,
      })),
    }
  }, [data, range])

  if (isLoading || !data || !periodStats) return <Loader />

  const collected = financings.reduce((sum, f) => sum + f.paidAmountDzd, 0)
  const disbursed = merchantPayouts
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amountDzd, 0)
  const profit = Math.round(periodStats.periodRevenue * 0.18)
  const defaultRate = (financings.filter((f) => f.status === 'defaulted').length / financings.length) * 100
  const periodLabel = t(`timeRange.${range}`)
  const axisFmt = (v: string) => formatChartAxisLabel(v, range)

  const slices = data.portfolio.map((p) => ({
    name: t(`status.${p.name}`),
    value: p.value,
    color: p.color,
  }))
  const totalFinancings = slices.reduce((sum, s) => sum + s.value, 0)

  return (
    <div className="animate-fade-up">
      <PageHeader title={t('reports.title')} subtitle={t('reports.subtitle')}>
        <TimeRangePicker value={range} onChange={setRange} />
        <Button variant="secondary" size="sm" onClick={() => toast(t('common.actionDemo'))}>
          <Download size={15} />
          {t('reports.export')}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t('reports.kpis.collected')}
          value={formatDzd(collected, locale)}
          icon={Banknote}
          trend={15}
        />
        <KpiCard
          label={t('reports.kpis.disbursed')}
          value={formatDzd(disbursed, locale)}
          icon={Send}
          trend={9}
        />
        <KpiCard
          label={t('reports.kpis.profit')}
          value={formatDzd(profit, locale)}
          icon={TrendingUp}
          trend={periodStats.revenueTrend}
        />
        <KpiCard
          label={t('reports.kpis.defaultRate')}
          value={`${defaultRate.toFixed(1)}%`}
          icon={AlertTriangle}
          accent="warning"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden p-0 lg:col-span-2">
          <div className="flex flex-col gap-3 border-b border-border bg-gradient-to-r from-primary-surface/70 to-transparent px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">{t('reports.revenueTitle')}</p>
              <p className="mt-0.5 text-xs text-foreground-tertiary">
                {t('timeRange.chartHint', { period: periodLabel })}
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
          <p className="text-md font-medium text-foreground">{t('reports.portfolioTitle')}</p>
          <div className="mt-2">
            <DonutChart
              data={slices}
              centerValue={String(totalFinancings)}
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

      <Card className="mt-4 overflow-hidden p-0">
        <div className="border-b border-border bg-gradient-to-r from-primary-surface/70 to-transparent px-5 py-4">
          <p className="text-sm font-semibold text-foreground">{t('reports.financingsTitle')}</p>
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
            height={240}
          />
        </div>
      </Card>
    </div>
  )
}
