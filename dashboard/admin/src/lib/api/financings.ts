// Admin — Active / completed financings.

import { apiClient } from '../apiClient'
import type { Enum, ListParams, Paginated } from './types'

export type Financing = {
  id: number
  reference: string
  status: Enum
  request_id?: number | null
  request?: { id: number; reference: string; product_name: string } | null
  client_id?: number
  merchant_id?: number
  client?: {
    id: number
    user?: { id: number; full_name: string; phone: string } | null
    full_name?: string
    phone?: string
  } | null
  merchant?: {
    id: number
    business_name_ar?: string
    business_name_fr?: string | null
    business_name?: string
  } | null
  plan_id?: number | null
  plan?: { id: number; duration_months: number; margin_rate: number } | null
  /** Convenience product name — may live on the request payload. */
  product_name?: string
  principal_amount_dzd?: number
  merchant_commission_dzd?: number
  merchant_payout_dzd?: number
  client_margin_dzd?: number
  total_to_collect_dzd?: number
  monthly_installment_dzd?: number
  total_profit_dzd?: number
  paid_amount_dzd?: number
  /** Backend uses `remaining_amount_dzd`; we still accept `remaining_dzd`. */
  remaining_amount_dzd?: number
  remaining_dzd?: number
  duration_months: number
  first_due_date?: string | null
  last_due_date?: string | null
  next_due_date?: string | null
  late_installments_count?: number
  installments_count?: number
  paid_installments_count?: number
  /** Legacy alias kept for callers. */
  paid_installments?: number
  paid_percent?: number
  activated_at: string
  completed_at?: string | null
  defaulted_at?: string | null
  created_at?: string
  updated_at?: string
}

export type Installment = {
  number: number
  due_date: string
  amount_dzd: number
  status: Enum
  paid_at?: string | null
  days_late?: number
}

export type FinancingsFilters = ListParams & {
  status?: string
  late_only?: boolean
}

export async function listFinancings(
  params: FinancingsFilters = {},
): Promise<Paginated<Financing>> {
  const { data } = await apiClient.get<Paginated<Financing>>(
    '/admin/financings',
    { params },
  )
  return data
}

export async function getFinancing(reference: string): Promise<Financing> {
  const { data } = await apiClient.get<{ data: Financing }>(
    `/admin/financings/${reference}`,
  )
  return data.data
}

export async function getInstallments(
  reference: string,
): Promise<Installment[]> {
  const { data } = await apiClient.get<{ data: Installment[] }>(
    `/admin/financings/${reference}/installments`,
  )
  return data.data
}

export async function rescheduleInstallment(
  reference: string,
  payload: { installment_number: number; new_due_date: string; reason?: string },
): Promise<void> {
  await apiClient.post(`/admin/financings/${reference}/reschedule`, payload)
}

export async function writeOff(
  reference: string,
  payload: { reason: string; notes?: string },
): Promise<void> {
  await apiClient.post(`/admin/financings/${reference}/write-off`, payload)
}
