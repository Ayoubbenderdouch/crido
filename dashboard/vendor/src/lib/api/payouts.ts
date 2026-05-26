// /merchant/payouts endpoints.

import { apiClient } from '@/lib/apiClient'
import type { Payout, PayoutMethod, PayoutStatus } from '@/lib/mock/data'
import { unwrapValue, type EnumValue } from './shared'

type ApiPayout = {
  id: number
  reference: string
  financing_id: number | null
  financing?: { id: number | null; reference: string | null } | null
  amount_dzd: number
  method: EnumValue
  external_reference: string | null
  delivery_agent: { id?: number; full_name?: string; phone?: string } | null
  delivered_at: string | null
  status: EnumValue
  paid_at: string | null
  notes: string | null
  created_at: string | null
}

function adapt(raw: ApiPayout): Payout {
  const status = (unwrapValue(raw.status) ?? 'pending') as PayoutStatus
  const methodRaw = unwrapValue(raw.method) ?? 'ccp_transfer'
  // The mock dataset doesn't include 'bank_transfer'; fall back to CCP.
  const method = (methodRaw === 'bank_transfer' ? 'ccp_transfer' : methodRaw) as PayoutMethod
  return {
    reference: raw.reference,
    financingRef: raw.financing?.reference ?? '',
    customerName: '',
    productName: '',
    amountDzd: Number(raw.amount_dzd ?? 0),
    method,
    status,
    externalRef: raw.external_reference,
    agentName: raw.delivery_agent?.full_name ?? null,
    expectedDate: (raw.delivered_at ?? raw.created_at ?? '').slice(0, 10),
    paidAt: raw.paid_at ? raw.paid_at.slice(0, 10) : null,
  }
}

export async function fetchPayouts(): Promise<Payout[]> {
  const { data } = await apiClient.get<{ data: ApiPayout[] }>('/merchant/payouts')
  return data.data.map(adapt)
}

export async function fetchPayout(reference: string): Promise<Payout | undefined> {
  if (!reference) return undefined
  const { data } = await apiClient.get<{ data: ApiPayout }>(
    `/merchant/payouts/${encodeURIComponent(reference)}`,
  )
  return adapt(data.data)
}
