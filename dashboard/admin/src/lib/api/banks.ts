// Admin — Banks list management.

import { apiClient } from '../apiClient'

export type Bank = {
  id: number
  code: string
  name_ar: string
  name_fr: string
  logo_url?: string | null
  is_visible: boolean
  sort_order: number
}

export async function listBanks(): Promise<Bank[]> {
  const { data } = await apiClient.get<{ data: Bank[] }>('/admin/banks')
  return data.data
}

export async function updateBank(
  id: number,
  payload: Partial<Pick<Bank, 'is_visible' | 'sort_order' | 'name_ar' | 'name_fr'>>,
): Promise<Bank> {
  const { data } = await apiClient.patch<{ data: Bank }>(
    `/admin/banks/${id}`,
    payload,
  )
  return data.data
}
