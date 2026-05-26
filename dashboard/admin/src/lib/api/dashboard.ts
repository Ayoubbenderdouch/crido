// Admin dashboard — aggregate stats + chart series.

import { apiClient } from '../apiClient'

export type DashboardStats = {
  clients: { total: number; active: number; kyc_pending: number }
  merchants: { total: number; active: number; pending: number; ad_hoc: number }
  requests: { total: number; under_review: number; pending_today: number }
  financings: {
    active: number
    completed: number
    defaulted: number
    total_outstanding_dzd: number
  }
  payments: {
    pending_verification: number
    this_month_collected_dzd: number
  }
  payouts: { pending: number; processing: number }
  revenue: { mtd_dzd: number; ytd_dzd: number }
}

export type ChartKind = 'revenue' | 'financings' | 'defaults'
export type ChartPeriod = '7d' | '30d' | '90d' | '12m'

export type ChartSeries = {
  period: ChartPeriod
  from: string
  to: string
  series: { date: string; value: number }[]
}

export async function fetchStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get<DashboardStats>('/admin/dashboard/stats')
  return data
}

export async function fetchChart(
  kind: ChartKind,
  period: ChartPeriod = '30d',
): Promise<ChartSeries> {
  const { data } = await apiClient.get<ChartSeries>(
    `/admin/dashboard/charts/${kind}`,
    { params: { period } },
  )
  return data
}
