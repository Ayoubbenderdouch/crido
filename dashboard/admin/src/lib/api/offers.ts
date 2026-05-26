// Admin — Offers.

import { apiClient } from '../apiClient'

export type Offer = {
  id: number
  title_ar: string
  title_fr: string
  description_ar?: string | null
  description_fr?: string | null
  banner_url?: string | null
  starts_at: string
  ends_at: string
  is_active: boolean
}

export type OfferPayload = {
  title_ar: string
  title_fr: string
  description_ar?: string
  description_fr?: string
  banner_url?: string
  starts_at: string
  ends_at: string
  is_active?: boolean
}

export async function listOffers(): Promise<Offer[]> {
  const { data } = await apiClient.get<{ data: Offer[] }>('/admin/offers')
  return data.data
}

export async function createOffer(payload: OfferPayload): Promise<Offer> {
  const { data } = await apiClient.post<{ data: Offer }>(
    '/admin/offers',
    payload,
  )
  return data.data
}

export async function updateOffer(
  id: number,
  payload: Partial<OfferPayload>,
): Promise<Offer> {
  const { data } = await apiClient.patch<{ data: Offer }>(
    `/admin/offers/${id}`,
    payload,
  )
  return data.data
}

export async function destroyOffer(id: number): Promise<void> {
  await apiClient.delete(`/admin/offers/${id}`)
}
