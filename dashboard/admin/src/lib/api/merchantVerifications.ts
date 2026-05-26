// Admin — Ad-hoc merchant phone verification queue.

import { apiClient } from '../apiClient'
import type { Enum, ListParams, Paginated } from './types'

export type MerchantVerification = {
  id: number
  merchant_id?: number | null
  request_id?: number | null
  request_reference?: string
  called_phone?: string
  /** Legacy alias used by the dashboard adapter. */
  proposed_merchant_phone?: string
  proposed_merchant_name?: string
  proposed_merchant_address?: string | null
  outcome?: Enum | null
  notes?: string | null
  called_at?: string | null
  created_at: string
  /** Joined columns the admin endpoint may attach for convenience. */
  customer_name?: string
  customer_phone?: string
  amount_dzd?: number
  plan_months?: number
}

export type VerificationListParams = ListParams & {
  pending_only?: boolean
}

export async function listVerifications(
  params: VerificationListParams = {},
): Promise<Paginated<MerchantVerification>> {
  const { data } = await apiClient.get<Paginated<MerchantVerification>>(
    '/admin/merchant-verifications',
    { params },
  )
  return data
}

export async function logVerification(payload: {
  request_reference: string
  outcome: 'confirmed' | 'denied' | 'unreachable' | 'postponed'
  notes?: string
}): Promise<void> {
  await apiClient.post('/admin/merchant-verifications', payload)
}
