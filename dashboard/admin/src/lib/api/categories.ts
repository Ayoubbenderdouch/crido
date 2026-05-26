// Admin — Catalog categories.

import { apiClient } from '../apiClient'

export type Category = {
  id: number
  name_ar: string
  name_fr: string
  slug?: string
  icon?: string | null
  parent_id?: number | null
  is_active: boolean
  sort_order?: number
}

export type CategoryPayload = {
  name_ar: string
  name_fr: string
  slug?: string
  icon?: string | null
  parent_id?: number | null
  is_active?: boolean
  sort_order?: number
}

export async function listCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<{ data: Category[] }>(
    '/admin/categories',
  )
  return data.data
}

export async function createCategory(payload: CategoryPayload): Promise<Category> {
  const { data } = await apiClient.post<{ data: Category }>(
    '/admin/categories',
    payload,
  )
  return data.data
}

export async function updateCategory(
  id: number,
  payload: Partial<CategoryPayload>,
): Promise<Category> {
  const { data } = await apiClient.patch<{ data: Category }>(
    `/admin/categories/${id}`,
    payload,
  )
  return data.data
}

export async function destroyCategory(id: number): Promise<void> {
  await apiClient.delete(`/admin/categories/${id}`)
}
