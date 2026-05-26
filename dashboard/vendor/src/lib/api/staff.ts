// /merchant/staff endpoints — invite, update, delete.

import { apiClient } from '@/lib/apiClient'
import type { Staff, StaffRole } from '@/lib/mock/data'
import { unwrapValue, type EnumValue } from './shared'

type ApiUserBrief = {
  id: number
  full_name?: string | null
  phone?: string | null
  email?: string | null
  last_login_at?: string | null
}

type ApiStaff = {
  id: number
  merchant_id: number
  user_id: number
  user: ApiUserBrief | null
  role: EnumValue
  permissions: string[] | null
  is_active: boolean
  created_at: string | null
  updated_at: string | null
}

function adapt(raw: ApiStaff): Staff {
  const role = (unwrapValue(raw.role) ?? 'viewer') as StaffRole
  return {
    id: raw.id,
    name: raw.user?.full_name ?? '—',
    phone: raw.user?.phone ?? '',
    role,
    lastLoginAt: raw.user?.last_login_at ? raw.user.last_login_at.slice(0, 10) : null,
    active: Boolean(raw.is_active),
  }
}

export async function fetchStaff(): Promise<Staff[]> {
  const { data } = await apiClient.get<{ data: ApiStaff[] }>('/merchant/staff')
  return data.data.map(adapt)
}

export type InviteStaffInput = {
  full_name: string
  phone: string
  role: Exclude<StaffRole, 'owner'>
}

export async function inviteStaff(input: InviteStaffInput): Promise<Staff> {
  const { data } = await apiClient.post<{ data: ApiStaff }>('/merchant/staff', input)
  return adapt(data.data)
}

export type UpdateStaffInput = {
  role?: StaffRole
  is_active?: boolean
}

export async function updateStaff(id: number, input: UpdateStaffInput): Promise<Staff> {
  const { data } = await apiClient.patch<{ data: ApiStaff }>(`/merchant/staff/${id}`, input)
  return adapt(data.data)
}

export async function deleteStaff(id: number): Promise<void> {
  await apiClient.delete(`/merchant/staff/${id}`)
}
