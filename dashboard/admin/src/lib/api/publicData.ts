// Public reference data — no auth required.

import { apiClient } from '../apiClient'

export type Wilaya = {
  id: number
  code: string
  name_ar: string
  name_fr: string
  is_active: boolean
}

export type Commune = {
  id: number
  wilaya_id: number
  name_ar: string
  name_fr: string
}

export type PublicBank = {
  id: number
  code: string
  name_ar: string
  name_fr: string
  logo_url?: string | null
}

export type PublicCategory = {
  id: number
  name_ar: string
  name_fr: string
  slug?: string
  icon?: string | null
}

export type PublicFinancingPlan = {
  id: number
  duration_months: number
  margin_rate: number
  min_amount_dzd: number
  max_amount_dzd: number
}

export async function fetchWilayas(): Promise<Wilaya[]> {
  const { data } = await apiClient.get<{ data: Wilaya[] }>('/public/wilayas')
  return data.data
}

export async function fetchBanks(): Promise<PublicBank[]> {
  const { data } = await apiClient.get<{ data: PublicBank[] }>('/public/banks')
  return data.data
}

export async function fetchCategories(): Promise<PublicCategory[]> {
  const { data } = await apiClient.get<{ data: PublicCategory[] }>(
    '/public/categories',
  )
  return data.data
}

export async function fetchFinancingPlans(): Promise<PublicFinancingPlan[]> {
  const { data } = await apiClient.get<{ data: PublicFinancingPlan[] }>(
    '/public/financing-plans',
  )
  return data.data
}
