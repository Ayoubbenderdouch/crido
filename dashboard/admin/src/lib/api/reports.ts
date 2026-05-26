// Admin — Reports (revenue, portfolio, risk).

import { apiClient } from '../apiClient'

export type ReportKind = 'revenue' | 'portfolio' | 'risk'

export type ReportPayload = Record<string, unknown> & {
  period?: string
  from?: string
  to?: string
}

export async function fetchReport<T = unknown>(
  kind: ReportKind,
  params: { from?: string; to?: string; period?: string } = {},
): Promise<T> {
  const { data } = await apiClient.get<T>(`/admin/reports/${kind}`, { params })
  return data
}
