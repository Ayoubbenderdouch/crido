// Admin — Merchants (partner + ad_hoc).

import { apiClient } from '../apiClient'
import type { Enum, ListParams, Paginated } from './types'

export type AdminMerchant = {
  id: number
  uuid?: string
  slug?: string | null
  source: Enum
  status: Enum
  business_type?: Enum | null
  /** Arabic business name (primary). */
  business_name_ar: string
  business_name_fr?: string | null
  /** Convenience alias when API surfaces a flat business_name. */
  business_name?: string
  description_ar?: string | null
  description_fr?: string | null
  rc_number?: string | null
  nif_number?: string | null
  nis_number?: string | null
  art_number?: string | null
  logo_url?: string | null
  cover_url?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  address?: string | null
  wilaya_id?: number | null
  commune_id?: number | null
  wilaya?: { id: number; name_ar: string; name_fr: string } | null
  commune?: { id: number; name_ar: string; name_fr: string } | null
  location_lat?: number | null
  location_lng?: number | null
  commission_rate_default?: number
  /** Legacy alias still emitted by some endpoints. */
  commission_rate?: number
  balance_dzd?: number
  total_sales_dzd?: number
  total_financings?: number
  month_sales_dzd?: number
  pending_payout_dzd?: number
  pending_requests_count?: number
  total_payouts_count?: number
  branches_count?: number
  products_count?: number
  staff_count?: number
  primary_bank_id?: number | null
  bank_account_number?: string | null
  bank_rib?: string | null
  ccp_account_number?: string | null
  ccp_rib?: string | null
  verified_by_phone_at?: string | null
  verification_call_notes?: string | null
  approved_at?: string | null
  created_at?: string
  updated_at?: string
  last_activity_at?: string | null
  category?: { id: number; name_ar: string; name_fr: string } | null
  tagline?: string | null
  description?: string | null
}

export type MerchantsFilters = ListParams & {
  source?: 'partner' | 'ad_hoc'
  status?: string
}

export async function listMerchants(
  params: MerchantsFilters = {},
): Promise<Paginated<AdminMerchant>> {
  const { data } = await apiClient.get<Paginated<AdminMerchant>>(
    '/admin/merchants',
    { params },
  )
  return data
}

export async function getMerchant(
  id: number | string,
): Promise<AdminMerchant> {
  const { data } = await apiClient.get<{ data: AdminMerchant }>(
    `/admin/merchants/${id}`,
  )
  return data.data
}

export async function approveMerchant(
  id: number | string,
  payload: { commission_rate?: number; notes?: string } = {},
): Promise<void> {
  await apiClient.post(`/admin/merchants/${id}/approve`, payload)
}

export async function suspendMerchant(
  id: number | string,
  payload: { reason: string; notes?: string },
): Promise<void> {
  await apiClient.post(`/admin/merchants/${id}/suspend`, payload)
}

export async function convertToPartner(
  id: number | string,
  payload: { commission_rate?: number; notes?: string } = {},
): Promise<void> {
  await apiClient.post(`/admin/merchants/${id}/convert-to-partner`, payload)
}
