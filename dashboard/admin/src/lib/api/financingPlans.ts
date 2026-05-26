// Admin — Financing plan CRUD (duration, margin, amount range).

import { apiClient } from '../apiClient'

export type FinancingPlan = {
  id: number
  duration_months: number
  margin_rate: number
  merchant_commission_rate: number
  min_amount_dzd: number
  max_amount_dzd: number
  is_active: boolean
  description_ar?: string | null
  description_fr?: string | null
}

export type FinancingPlanPayload = {
  duration_months: number
  margin_rate: number
  merchant_commission_rate: number
  min_amount_dzd: number
  max_amount_dzd: number
  is_active?: boolean
  description_ar?: string
  description_fr?: string
}

export async function listPlans(): Promise<FinancingPlan[]> {
  const { data } = await apiClient.get<{ data: FinancingPlan[] }>(
    '/admin/financing-plans',
  )
  return data.data
}

export async function createPlan(
  payload: FinancingPlanPayload,
): Promise<FinancingPlan> {
  const { data } = await apiClient.post<{ data: FinancingPlan }>(
    '/admin/financing-plans',
    payload,
  )
  return data.data
}

export async function updatePlan(
  id: number,
  payload: Partial<FinancingPlanPayload>,
): Promise<FinancingPlan> {
  const { data } = await apiClient.patch<{ data: FinancingPlan }>(
    `/admin/financing-plans/${id}`,
    payload,
  )
  return data.data
}

export async function destroyPlan(id: number): Promise<void> {
  await apiClient.delete(`/admin/financing-plans/${id}`)
}
