export type ProductCategory = 'phone' | 'pc' | 'appliance' | 'other'

export type ProductVisual = {
  /** Lokales Foto unter /public/products — lädt immer. */
  imageSrc: string | null
  accentClass: string
  category: ProductCategory
}

const LOCAL = {
  iphone: '/products/iphone-15.jpg',
  samsung: '/products/samsung-a55.jpg',
  laptop: '/products/laptop-hp.jpg',
} as const

function visual(imageSrc: string | null, accentClass: string, category: ProductCategory): ProductVisual {
  return { imageSrc, accentClass, category }
}

export function getProductVisual(productName: string): ProductVisual {
  const n = productName.toLowerCase()

  if (n.includes('galaxy') || n.includes('samsung'))
    return visual(LOCAL.samsung, 'from-primary/15 via-primary-surface/40 to-background', 'phone')

  if (n.includes('iphone') || n.includes('هاتف') || n.includes('phone'))
    return visual(LOCAL.iphone, 'from-primary/15 via-primary-surface/40 to-background', 'phone')

  if (
    n.includes('حاسوب') ||
    n.includes('لابتوب') ||
    n.includes('laptop') ||
    n.includes('كمبيوتر') ||
    n.includes('hp') ||
    n.includes('macbook')
  )
    return visual(LOCAL.laptop, 'from-slate-500/10 via-background to-background', 'pc')

  if (n.includes('غسالة') || n.includes('washer') || n.includes('condor') || n.includes('ثلاجة') || n.includes('تلفاز') || n.includes('مكيف'))
    return visual(null, 'from-info/15 via-background to-background', 'appliance')

  if (n.includes('صالون') || n.includes('غرفة') || n.includes('مطبخ') || n.includes('أثاث'))
    return visual(null, 'from-warning/12 to-background', 'other')

  return visual(LOCAL.iphone, 'from-primary/10 to-background-secondary', 'other')
}
