// Admin — Clients (KYC, credit limit, blacklist).

import { apiClient } from '../apiClient'
import type { Enum, ListParams, Paginated } from './types'

export type AdminClient = {
  id: number
  user_id?: number
  /** Nested user — primary location of name/phone in the admin resource. */
  user?: {
    id: number
    full_name: string
    phone: string
    role?: string
    locale?: string
    email?: string | null
  } | null
  /** Convenience top-level mirror (set by the dashboard list endpoint). */
  full_name?: string
  phone?: string
  email?: string | null
  uuid?: string
  date_of_birth?: string | null
  gender?: Enum | null
  marital_status?: Enum | null
  national_id_number?: string | null
  nin_18digits?: string | null
  address?: string | null
  wilaya_id?: number | null
  commune_id?: number | null
  wilaya?: { id: number; name_ar: string; name_fr: string } | null
  commune?: { id: number; name_ar: string; name_fr: string } | null
  employment_status?: Enum | null
  employer_name?: string | null
  profession?: string | null
  monthly_income_dzd?: number | null
  primary_bank_id?: number | null
  primary_bank?: unknown | null
  bank_account_number?: string | null
  bank_rib?: string | null
  ccp_account_number?: string | null
  ccp_rib?: string | null
  credit_score?: number | null
  credit_tier?: Enum | null
  credit_limit_dzd?: number
  used_credit_dzd?: number
  available_credit_dzd?: number
  kyc_status: Enum
  kyc_submitted_at?: string | null
  kyc_reviewed_at?: string | null
  kyc_expires_at?: string | null
  kyc_rejection_reason?: string | null
  guarantors_count?: number
  blacklist?: unknown | null
  financings_count?: number
  active_financings_count?: number
  total_paid_dzd?: number
  total_outstanding_dzd?: number
  created_at?: string
  updated_at?: string
  last_activity_at?: string | null
}

export type ClientsFilters = ListParams & {
  kyc_status?: string
  wilaya_id?: number
  tier?: string
}

export async function listClients(
  params: ClientsFilters = {},
): Promise<Paginated<AdminClient>> {
  const { data } = await apiClient.get<Paginated<AdminClient>>(
    '/admin/clients',
    { params },
  )
  return data
}

export async function getClient(id: number | string): Promise<AdminClient> {
  const { data } = await apiClient.get<{ data: AdminClient }>(
    `/admin/clients/${id}`,
  )
  return data.data
}

export async function approveKyc(
  id: number | string,
  payload: { credit_limit_dzd?: number; notes?: string } = {},
): Promise<void> {
  await apiClient.post(`/admin/clients/${id}/kyc/approve`, payload)
}

export async function rejectKyc(
  id: number | string,
  payload: { reason: string; notes?: string },
): Promise<void> {
  await apiClient.post(`/admin/clients/${id}/kyc/reject`, payload)
}

export async function updateCreditLimit(
  id: number | string,
  payload: { credit_limit_dzd: number; reason?: string },
): Promise<void> {
  await apiClient.patch(`/admin/clients/${id}/credit-limit`, payload)
}

export async function blacklist(
  id: number | string,
  payload: { severity: string; reason: string; expires_at?: string },
): Promise<void> {
  await apiClient.post(`/admin/clients/${id}/blacklist`, payload)
}
