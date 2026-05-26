// Admin — Staff users management.

import { apiClient } from '../apiClient'
import type { Enum, ListParams, Paginated } from './types'

export type AdminUser = {
  id: number
  uuid: string
  role: string
  full_name: string
  phone: string
  email?: string | null
  locale: string
  status: Enum
  permissions: string[]
  created_at: string
  last_login_at?: string | null
}

export type UserPayload = {
  full_name: string
  phone: string
  email?: string
  role: string
  password?: string
}

export async function listUsers(
  params: ListParams = {},
): Promise<Paginated<AdminUser>> {
  const { data } = await apiClient.get<Paginated<AdminUser>>(
    '/admin/users',
    { params },
  )
  return data
}

export async function getUser(id: number | string): Promise<AdminUser> {
  const { data } = await apiClient.get<{ data: AdminUser }>(
    `/admin/users/${id}`,
  )
  return data.data
}

export async function createUser(payload: UserPayload): Promise<AdminUser> {
  const { data } = await apiClient.post<{ data: AdminUser }>(
    '/admin/users',
    payload,
  )
  return data.data
}

export async function updateUser(
  id: number | string,
  payload: Partial<UserPayload>,
): Promise<AdminUser> {
  const { data } = await apiClient.patch<{ data: AdminUser }>(
    `/admin/users/${id}`,
    payload,
  )
  return data.data
}

export async function suspendUser(id: number | string): Promise<void> {
  await apiClient.post(`/admin/users/${id}/suspend`)
}
