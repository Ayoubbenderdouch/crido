// /merchant/financings endpoints.

import { apiClient } from '@/lib/apiClient'
import type { Financing, FinancingStatus } from '@/lib/mock/data'
import { unwrapValue, type EnumValue } from './shared'

type ApiClientBrief = {
  id: number
  full_name: string | null
  phone: string | null
}

type ApiFinancing = {
  id: number
  reference: string
  status: EnumValue
  client: ApiClientBrief | null
  principal_amount_dzd: number
  merchant_commission_dzd: number
  merchant_payout_dzd: number
  duration_months: number
  activated_at: string | null
  created_at: string | null
}

function adapt(raw: ApiFinancing): Financing {
  const status = (unwrapValue(raw.status) ?? 'active') as FinancingStatus
  return {
    reference: raw.reference,
    requestRef: raw.reference, // not exposed separately by the API yet
    customerName: raw.client?.full_name ?? '—',
    productName: '',
    totalAmountDzd: Number(raw.principal_amount_dzd ?? 0),
    payoutDzd: Number(raw.merchant_payout_dzd ?? 0),
    payoutPaid: false,
    planMonths: Number(raw.duration_months ?? 0),
    status,
    activatedAt: (raw.activated_at ?? raw.created_at ?? '').slice(0, 10),
  }
}

export async function fetchFinancings(): Promise<Financing[]> {
  const { data } = await apiClient.get<{ data: ApiFinancing[] }>('/merchant/financings')
  return data.data.map(adapt)
}

export async function fetchFinancing(reference: string): Promise<Financing | undefined> {
  if (!reference) return undefined
  const { data } = await apiClient.get<{ data: ApiFinancing }>(
    `/merchant/financings/${encodeURIComponent(reference)}`,
  )
  return adapt(data.data)
}
