// /merchant/customers endpoints.

import { apiClient } from '@/lib/apiClient'
import type { Customer, CustomerStatus } from '@/lib/mock/data'

type ApiCustomer = {
  client_id: number
  client_full_name: string | null
  client_phone: string | null
  total_financings_count: number
  total_spent_dzd: number
  first_purchase_at: string | null
  last_purchase_at: string | null
}

function adapt(raw: ApiCustomer): Customer {
  const last = raw.last_purchase_at
  const lastDate = last ? new Date(last) : null
  const now = new Date()
  const days = lastDate ? (now.getTime() - lastDate.getTime()) / 86400000 : Infinity
  const status: CustomerStatus = days < 180 ? 'active' : 'inactive'

  return {
    id: raw.client_id,
    name: raw.client_full_name ?? '—',
    phone: raw.client_phone ?? '',
    commune: '',
    purchaseCount: Number(raw.total_financings_count ?? 0),
    totalSpentDzd: Number(raw.total_spent_dzd ?? 0),
    firstPurchaseAt: (raw.first_purchase_at ?? '').slice(0, 10),
    lastPurchaseAt: (raw.last_purchase_at ?? '').slice(0, 10),
    status,
  }
}

export async function fetchCustomers(): Promise<Customer[]> {
  const { data } = await apiClient.get<{ data: ApiCustomer[] }>('/merchant/customers')
  return data.data.map(adapt)
}

type ApiCustomerDetail = ApiCustomer & {
  total_collected_dzd?: number
  financings_by_status?: Record<string, number>
}

export async function fetchCustomer(clientId: number): Promise<Customer | undefined> {
  if (!clientId) return undefined
  const { data } = await apiClient.get<ApiCustomerDetail>(
    `/merchant/customers/${encodeURIComponent(String(clientId))}`,
  )
  return adapt(data)
}
