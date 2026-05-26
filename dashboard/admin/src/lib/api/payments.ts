// Admin — Payment verification queue.

import { apiClient } from '../apiClient'
import type { Enum, ListParams, Paginated } from './types'

export type Payment = {
  id: number
  reference: string
  status: Enum
  method: Enum
  amount_dzd: number
  client_id?: number
  financing_id?: number
  installment_id?: number | null
  external_reference?: string | null
  client?: {
    id: number
    full_name: string
    phone?: string
  } | null
  financing?: {
    id: number
    reference: string
    remaining_amount_dzd?: number
  } | null
  proof_image_path?: string | null
  proof_image_url?: string | null
  proof_uploaded_at?: string | null
  rejection_reason?: string | null
  verified_by?: number | null
  verified_at?: string | null
  paid_at?: string | null
  /** Legacy alias still emitted by some callers. */
  submitted_at?: string
  created_at?: string
  updated_at?: string
}

export type PaymentsFilters = ListParams & {
  status?: string
}

export async function listPayments(
  params: PaymentsFilters = {},
): Promise<Paginated<Payment>> {
  const { data } = await apiClient.get<Paginated<Payment>>(
    '/admin/payments',
    { params },
  )
  return data
}

export async function getPayment(reference: string): Promise<Payment> {
  const { data } = await apiClient.get<{ data: Payment }>(
    `/admin/payments/${reference}`,
  )
  return data.data
}

export async function verifyPayment(
  reference: string,
  payload: { notes?: string } = {},
): Promise<void> {
  await apiClient.post(`/admin/payments/${reference}/verify`, payload)
}

export async function rejectPayment(
  reference: string,
  payload: { reason: string; notes?: string },
): Promise<void> {
  await apiClient.post(`/admin/payments/${reference}/reject`, payload)
}
