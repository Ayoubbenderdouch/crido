// /merchant/products endpoints.

import { apiClient } from '@/lib/apiClient'
import type { Product } from '@/lib/mock/data'

type ApiCategory = {
  id: number
  name_ar?: string | null
  name_fr?: string | null
}

type ApiProduct = {
  id: number
  merchant_id: number
  category_id: number | null
  category: ApiCategory | null
  name_ar: string
  name_fr: string | null
  description_ar: string | null
  description_fr: string | null
  sku: string | null
  base_price_dzd: number
  image_url: string | null
  gallery: string[] | null
  stock_quantity: number
  is_available: boolean
  sort_order: number
}

function adapt(raw: ApiProduct): Product {
  return {
    id: raw.id,
    name: raw.name_ar,
    nameFr: raw.name_fr ?? raw.name_ar,
    category: raw.category?.name_ar ?? raw.category?.name_fr ?? '',
    priceDzd: Number(raw.base_price_dzd ?? 0),
    sku: raw.sku ?? '',
    stock: raw.stock_quantity ?? null,
    available: Boolean(raw.is_available),
    descriptionAr: raw.description_ar ?? undefined,
    descriptionFr: raw.description_fr ?? undefined,
    coverImage: raw.image_url ?? undefined,
    gallery: raw.gallery ?? undefined,
  }
}

export async function fetchProducts(): Promise<Product[]> {
  const { data } = await apiClient.get<{ data: ApiProduct[] }>('/merchant/products')
  return data.data.map(adapt)
}

export async function fetchProduct(id: number): Promise<Product | undefined> {
  if (!id) return undefined
  const { data } = await apiClient.get<{ data: ApiProduct }>(
    `/merchant/products/${id}`,
  )
  return adapt(data.data)
}

export type ProductInput = {
  category_id?: number | null
  name_ar: string
  name_fr?: string | null
  description_ar?: string | null
  description_fr?: string | null
  sku?: string | null
  base_price_dzd: number
  stock_quantity?: number | null
  is_available?: boolean
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data } = await apiClient.post<{ data: ApiProduct }>('/merchant/products', input)
  return adapt(data.data)
}

export async function updateProduct(id: number, input: Partial<ProductInput>): Promise<Product> {
  const { data } = await apiClient.patch<{ data: ApiProduct }>(`/merchant/products/${id}`, input)
  return adapt(data.data)
}

export async function deleteProduct(id: number): Promise<void> {
  await apiClient.delete(`/merchant/products/${id}`)
}

export async function uploadProductImages(id: number, files: File[]): Promise<Product> {
  const fd = new FormData()
  for (const f of files) fd.append('images[]', f)
  const { data } = await apiClient.post<{ data: ApiProduct }>(
    `/merchant/products/${id}/images`,
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return adapt(data.data)
}
