import type { Product } from '@/lib/mock/data'

export const PRODUCT_CATEGORIES = [
  'هواتف ذكية',
  'أجهزة لوحية',
  'حواسيب',
  'تلفزيونات',
  'ملحقات',
  'إلكترونيات',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

const CATEGORY_STYLE: Record<string, { from: string; to: string; accent: string }> = {
  'هواتف ذكية': { from: '#0F6E56', to: '#1D9E75', accent: '#E1F5EE' },
  'أجهزة لوحية': { from: '#378ADD', to: '#5BA3E8', accent: '#E6F1FB' },
  حواسيب: { from: '#5F5E5A', to: '#888780', accent: '#F1EFE8' },
  تلفزيونات: { from: '#6B4FA0', to: '#9B7FD4', accent: '#F0EBFA' },
  ملحقات: { from: '#EF9F27', to: '#F5C563', accent: '#FEF6E8' },
  إلكترونيات: { from: '#0C5B47', to: '#0F6E56', accent: '#E1F5EE' },
}

export function getCategoryStyle(category: string) {
  return (
    CATEGORY_STYLE[category] ?? {
      from: '#0F6E56',
      to: '#1D9E75',
      accent: '#E1F5EE',
    }
  )
}

export function getProductCover(product: Pick<Product, 'coverImage' | 'category'>) {
  return product.coverImage ?? null
}

export async function compressImageFile(file: File, maxWidth = 960): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('not an image')
  }

  const bitmap = await createImageBitmap(file)
  const ratio = Math.min(1, maxWidth / bitmap.width)
  const w = Math.round(bitmap.width * ratio)
  const h = Math.round(bitmap.height * ratio)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas')
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()

  return canvas.toDataURL('image/jpeg', 0.82)
}
