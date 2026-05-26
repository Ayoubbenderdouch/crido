// Admin — Merchant payouts.

import { apiClient } from '../apiClient'
import type { Enum, ListParams, Paginated } from './types'

export type Payout = {
  id: number
  reference: string
  status: Enum
  method: Enum
  amount_dzd: number
  merchant_id?: number
  financing_id?: number
  merchant?: {
    id: number
    business_name_ar?: string
    business_name_fr?: string | null
    business_name?: string
    slug?: string | null
  } | null
  financing?: {
    id: number
    reference: string
  } | null
  client?: { id: number; full_name: string } | null
  external_reference?: string | null
  delivery_agent_id?: number | null
  delivered_at?: string | null
  signature_photo_path?: string | null
  signature_photo_url?: string | null
  processed_by?: number | null
  paid_at?: string | null
  notes?: string | null
  created_at: string
  updated_at?: string
  /** Convenience alias for any code that still expects proof_url. */
  proof_url?: string | null
}

export type PayoutsFilters = ListParams & {
  status?: string
}

export async function listPayouts(
  params: PayoutsFilters = {},
): Promise<Paginated<Payout>> {
  const { data } = await apiClient.get<Paginated<Payout>>(
    '/admin/payouts',
    { params },
  )
  return data
}

export async function getPayout(reference: string): Promise<Payout> {
  const { data } = await apiClient.get<{ data: Payout }>(
    `/admin/payouts/${reference}`,
  )
  return data.data
}

export async function markPaid(
  reference: string,
  payload: { paid_at?: string; reference_number?: string; notes?: string } = {},
): Promise<void> {
  await apiClient.post(`/admin/payouts/${reference}/mark-paid`, payload)
}

export async function bulkProcess(payload: {
  payout_references: string[]
  method: string
  notes?: string
}): Promise<void> {
  await apiClient.post('/admin/payouts/bulk-process', payload)
}

export async function assignAgent(
  reference: string,
  payload: { agent_id: number; scheduled_at?: string },
): Promise<void> {
  await apiClient.post(`/admin/payouts/${reference}/assign-agent`, payload)
}
