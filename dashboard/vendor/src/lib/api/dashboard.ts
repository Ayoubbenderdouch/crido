// /merchant/dashboard/* endpoints — stats + chart.
// Returns the same DashboardData shape the mock api produced so the
// existing DashboardPage doesn't need any changes.

import { apiClient } from '@/lib/apiClient'
import type { DashboardData } from '@/lib/mock/api'

type StatsResponse = {
  total_sales_dzd: number
  total_financings: number
  active_requests_count: number
  pending_payouts_count: number
  balance_dzd: number
  this_month_sales_dzd: number
  this_month_financings: number
}

type ChartPoint = { date: string; sales_dzd: number; financings: number }
type ChartResponse = { period: string; data: ChartPoint[] }

const DURATION_COLOR: Record<string, string> = {
  '6': '#1D9E75',
  '12': '#0F6E56',
}

export async function fetchStats(): Promise<StatsResponse> {
  const { data } = await apiClient.get<StatsResponse>('/merchant/dashboard/stats')
  return data
}

export async function fetchChart(period: '7d' | '30d' | '90d' = '30d'): Promise<ChartResponse> {
  const { data } = await apiClient.get<ChartResponse>('/merchant/dashboard/chart', {
    params: { period },
  })
  return data
}

/**
 * Returns a shape compatible with the legacy DashboardData type so that
 * the existing DashboardPage continues to work without modification.
 *
 * Some derived metrics (top products, plan distribution, sparklines) are
 * not yet provided by the API, so we synthesise sensible defaults.
 */
export async function fetchDashboard(): Promise<DashboardData> {
  const [stats, chart] = await Promise.all([fetchStats(), fetchChart('90d')])

  const daily = chart.data.map((p) => ({
    date: p.date,
    salesDzd: p.sales_dzd,
  }))
  // Need 365 entries in the legacy contract so the time-range filter works.
  // Pad earlier dates with zero so things like "year" still show all data.
  while (daily.length < 365) {
    const first = daily[0]
    if (!first) break
    const d = new Date(first.date)
    d.setDate(d.getDate() - 1)
    daily.unshift({ date: d.toISOString().slice(0, 10), salesDzd: 0 })
  }

  const recentFinancingsCounts = chart.data.map((p) => p.financings).slice(-12)
  const recentSales = daily.slice(-12).map((d) => d.salesDzd)

  // Trends: simple % growth from first half → second half of the chart period.
  const trend = (series: number[]): number => {
    if (series.length < 4) return 0
    const half = Math.floor(series.length / 2)
    const a = series.slice(0, half).reduce((s, v) => s + v, 0)
    const b = series.slice(half).reduce((s, v) => s + v, 0)
    if (a === 0) return b > 0 ? 100 : 0
    return Math.round(((b - a) / a) * 100)
  }

  return {
    kpis: {
      monthSalesDzd: stats.this_month_sales_dzd,
      monthlyGoalDzd: 1_500_000,
      totalFinancings: stats.total_financings,
      pendingRequests: stats.active_requests_count,
      pendingPayoutDzd: stats.balance_dzd,
    },
    trends: {
      sales: trend(recentSales),
      financings: trend(recentFinancingsCounts),
      payout: 0,
    },
    sparks: {
      sales: recentSales.length ? recentSales : [0],
      financings: recentFinancingsCounts.length ? recentFinancingsCounts : [0],
      requests: Array(12).fill(stats.active_requests_count),
      payout: Array(12).fill(stats.balance_dzd),
    },
    daily,
    topProducts: [],
    duration: [
      { name: '6', value: 0, color: DURATION_COLOR['6'] },
      { name: '12', value: 0, color: DURATION_COLOR['12'] },
    ],
  }
}
