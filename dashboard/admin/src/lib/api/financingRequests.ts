// Admin — Financing request queue.

import { apiClient } from '../apiClient'
import type { Enum, ListParams, Paginated } from './types'

export type FinancingRequest = {
  id: number
  reference: string
  status: Enum
  merchant_source: Enum
  client_id?: number
  merchant_id?: number | null
  branch_id?: number | null
  client?: {
    id: number
    user?: { id: number; full_name: string; phone: string } | null
    full_name?: string
    phone?: string
    credit_tier?: Enum | null
    kyc_status?: Enum
  } | null
  merchant?: {
    id: number
    business_name_ar?: string
    business_name_fr?: string | null
    business_name?: string
    source: Enum
    phone?: string | null
  } | null
  proposed_merchant_name?: string | null
  proposed_merchant_phone?: string | null
  proposed_merchant_address?: string | null
  plan_id?: number | null
  plan?: {
    id: number
    duration_months: number
    margin_rate: number
    merchant_commission_rate?: number
  } | null
  product_name: string
  product_description?: string | null
  product_category_id?: number | null
  product_amount_dzd: number
  monthly_installment_dzd?: number
  total_to_collect_dzd?: number
  admin_notes?: string | null
  rejection_reason?: string | null
  submitted_at?: string | null
  merchant_confirmed_at?: string | null
  approved_at?: string | null
  expires_at?: string | null
  created_at: string
  updated_at?: string
}

export type RequestsFilters = ListParams & {
  status?: string
}

export async function listRequests(
  params: RequestsFilters = {},
): Promise<Paginated<FinancingRequest>> {
  const { data } = await apiClient.get<Paginated<FinancingRequest>>(
    '/admin/financing-requests',
    { params },
  )
  return data
}

export async function getRequest(reference: string): Promise<FinancingRequest> {
  const { data } = await apiClient.get<{ data: FinancingRequest }>(
    `/admin/financing-requests/${reference}`,
  )
  return data.data
}

export async function approveRequest(
  reference: string,
  payload: { notes?: string } = {},
): Promise<void> {
  await apiClient.post(
    `/admin/financing-requests/${reference}/approve`,
    payload,
  )
}

export async function rejectRequest(
  reference: string,
  payload: { reason: string; notes?: string },
): Promise<void> {
  await apiClient.post(
    `/admin/financing-requests/${reference}/reject`,
    payload,
  )
}

export async function generateContracts(reference: string): Promise<void> {
  await apiClient.post(
    `/admin/financing-requests/${reference}/contracts/generate`,
  )
}
