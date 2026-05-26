// /merchant/profile endpoints.

import { apiClient } from '@/lib/apiClient'
import type { MerchantProfileEditable } from '@/lib/vendorStore'

type ApiBank = {
  id: number
  code?: string
  short_name_ar?: string
  short_name_fr?: string
  name_ar?: string
  name_fr?: string
}

type ApiWilaya = { id: number; name_ar?: string; name_fr?: string }
type ApiCommune = { id: number; name_ar?: string; name_fr?: string }

export type ApiMerchantProfile = {
  id: number
  slug: string
  source: { value: string } | string | null
  status: { value: string } | string | null
  business_type: { value: string } | string | null
  business_name_ar: string | null
  business_name_fr: string | null
  description_ar: string | null
  description_fr: string | null
  rc_number: string | null
  nif_number: string | null
  nis_number: string | null
  art_number: string | null
  logo_url: string | null
  cover_url: string | null
  phone: string | null
  email: string | null
  website: string | null
  address: string | null
  wilaya_id: number | null
  commune_id: number | null
  wilaya: ApiWilaya | null
  commune: ApiCommune | null
  location_lat: number | null
  location_lng: number | null
  commission_rate_default: number | null
  balance_dzd: number | null
  total_sales_dzd: number | null
  total_financings: number
  primary_bank_id: number | null
  primary_bank: ApiBank | null
  bank_account_number: string | null
  bank_rib: string | null
  ccp_account_number: string | null
  ccp_rib: string | null
  approved_at: string | null
  created_at: string | null
  updated_at: string | null
}

export async function fetchProfile(): Promise<ApiMerchantProfile> {
  const { data } = await apiClient.get<{ data: ApiMerchantProfile }>('/merchant/profile')
  return data.data
}

/**
 * Adapt the API merchant profile to the legacy editable shape used by
 * the profile-edit form (ProfileEditPage).
 */
export function toEditable(p: ApiMerchantProfile): MerchantProfileEditable {
  return {
    name: p.business_name_ar ?? '',
    nameFr: p.business_name_fr ?? '',
    tagline: '',
    description: p.description_ar ?? p.description_fr ?? '',
    phone: p.phone ?? '',
    email: p.email ?? '',
    website: p.website ?? '',
    address: p.address ?? '',
  }
}

export type UpdateProfileInput = {
  business_name_ar?: string
  business_name_fr?: string
  description_ar?: string
  description_fr?: string
  phone?: string
  email?: string
  website?: string
  address?: string
}

export async function updateProfile(input: UpdateProfileInput): Promise<ApiMerchantProfile> {
  const { data } = await apiClient.patch<{ data: ApiMerchantProfile }>(
    '/merchant/profile',
    input,
  )
  return data.data
}

export async function uploadLogo(file: File): Promise<ApiMerchantProfile> {
  const fd = new FormData()
  fd.append('file', file)
  const { data } = await apiClient.post<{ data: ApiMerchantProfile }>(
    '/merchant/profile/logo',
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data.data
}

export async function uploadCover(file: File): Promise<ApiMerchantProfile> {
  const fd = new FormData()
  fd.append('file', file)
  const { data } = await apiClient.post<{ data: ApiMerchantProfile }>(
    '/merchant/profile/cover',
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data.data
}
