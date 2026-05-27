// /merchant/financing-requests endpoints.
// Adapts the API response into the legacy IncomingRequest shape that
// RequestsPage and RequestDetailPage consume.

import { apiClient } from '@/lib/apiClient'
import type { IncomingRequest, RequestStatus } from '@/lib/mock/data'
import { unwrapValue, type EnumValue } from './shared'

type ApiClientBrief = {
  id: number
  full_name: string | null
  phone: string | null
}

type ApiPlan = {
  id: number
  duration_months?: number
  months?: number
  name_ar?: string | null
  name_fr?: string | null
}

type ApiFinancingRequest = {
  id: number
  reference: string
  status: EnumValue
  client: ApiClientBrief | null
  branch_id: number | null
  plan_id: number
  plan: ApiPlan | null
  product_name: string
  product_description: string | null
  product_amount_dzd: number
  submitted_at: string | null
  merchant_confirmed_at: string | null
  approved_at: string | null
  expires_at: string | null
  rejection_reason: string | null
  created_at: string | null
}

function adapt(raw: ApiFinancingRequest): IncomingRequest {
  const status = (unwrapValue(raw.status) ?? 'submitted') as RequestStatus
  const planMonths = raw.plan?.duration_months ?? raw.plan?.months ?? 0
  return {
    reference: raw.reference,
    customerId: raw.client?.id ?? 0,
    customerName: raw.client?.full_name ?? '—',
    customerPhone: raw.client?.phone ?? '',
    productName: raw.product_name,
    amountDzd: Number(raw.product_amount_dzd ?? 0),
    planMonths,
    branchName: '',
    status,
    createdAt: (raw.submitted_at ?? raw.created_at ?? '').slice(0, 10),
    submittedAt: raw.submitted_at ?? raw.created_at ?? new Date().toISOString(),
    merchantConfirmedAt: raw.merchant_confirmed_at ?? undefined,
    approvedAt: raw.approved_at ?? undefined,
    note: raw.rejection_reason ?? null,
  }
}

export async function fetchRequests(): Promise<IncomingRequest[]> {
  const { data } = await apiClient.get<{ data: ApiFinancingRequest[] }>(
    '/merchant/financing-requests',
  )
  return data.data.map(adapt)
}

export async function fetchRequest(reference: string): Promise<IncomingRequest | undefined> {
  if (!reference) return undefined
  const { data } = await apiClient.get<{ data: ApiFinancingRequest }>(
    `/merchant/financing-requests/${encodeURIComponent(reference)}`,
  )
  return adapt(data.data)
}

export async function confirmRequest(
  reference: string,
  notes?: string,
): Promise<IncomingRequest> {
  const { data } = await apiClient.post<{ data: ApiFinancingRequest }>(
    `/merchant/financing-requests/${encodeURIComponent(reference)}/confirm`,
    notes ? { notes } : {},
  )
  return adapt(data.data)
}

export async function rejectRequest(
  reference: string,
  reason: string,
): Promise<IncomingRequest> {
  const { data } = await apiClient.post<{ data: ApiFinancingRequest }>(
    `/merchant/financing-requests/${encodeURIComponent(reference)}/reject`,
    { reason },
  )
  return adapt(data.data)
}
