// /merchant/branches CRUD endpoints.

import { apiClient } from '@/lib/apiClient'
import type { Branch } from '@/lib/mock/data'

type ApiWilaya = { id: number; code?: string; name_ar?: string; name_fr?: string }
type ApiCommune = { id: number; name_ar?: string; name_fr?: string }

type ApiBranch = {
  id: number
  merchant_id: number
  name: string
  address: string | null
  wilaya_id: number | null
  commune_id: number | null
  wilaya: ApiWilaya | null
  commune: ApiCommune | null
  location_lat: number | null
  location_lng: number | null
  phone: string | null
  manager_name: string | null
  is_active: boolean
}

function adapt(raw: ApiBranch): Branch {
  return {
    id: raw.id,
    name: raw.name,
    wilaya: raw.wilaya?.name_ar ?? raw.wilaya?.name_fr ?? '',
    commune: raw.commune?.name_ar ?? raw.commune?.name_fr ?? '',
    street: raw.address ?? '',
    phone: raw.phone ?? '',
    managerName: raw.manager_name ?? '',
    active: Boolean(raw.is_active),
  }
}

export async function fetchBranches(): Promise<Branch[]> {
  const { data } = await apiClient.get<{ data: ApiBranch[] }>('/merchant/branches')
  return data.data.map(adapt)
}

export async function fetchBranch(id: number): Promise<Branch | undefined> {
  if (!id) return undefined
  const { data } = await apiClient.get<{ data: ApiBranch }>(`/merchant/branches/${id}`)
  return adapt(data.data)
}

export type BranchInput = {
  name: string
  address?: string | null
  wilaya_id?: number | null
  commune_id?: number | null
  phone?: string | null
  manager_name?: string | null
  is_active?: boolean
  location_lat?: number | null
  location_lng?: number | null
}

export async function createBranch(input: BranchInput): Promise<Branch> {
  const { data } = await apiClient.post<{ data: ApiBranch }>('/merchant/branches', input)
  return adapt(data.data)
}

export async function updateBranch(id: number, input: Partial<BranchInput>): Promise<Branch> {
  const { data } = await apiClient.patch<{ data: ApiBranch }>(`/merchant/branches/${id}`, input)
  return adapt(data.data)
}

export async function deleteBranch(id: number): Promise<void> {
  await apiClient.delete(`/merchant/branches/${id}`)
}
