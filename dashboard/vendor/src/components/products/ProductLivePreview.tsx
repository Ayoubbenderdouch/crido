import { useTranslation } from 'react-i18next'
import { Package } from 'lucide-react'
import { formatDzd, type Locale } from '@/lib/format'
import { getCategoryStyle } from '@/lib/productVisuals'
import { cn } from '@/lib/utils'

type Props = {
  locale: Locale
  name: string
  nameFr?: string
  category: string
  priceDzd: number
  stock: number
  sku: string
  available: boolean
  coverImage?: string
}

export default function ProductLivePreview({
  locale,
  name,
  nameFr,
  category,
  priceDzd,
  stock,
  sku,
  available,
  coverImage,
}: Props) {
  const { t } = useTranslation()
  const displayName = (locale === 'fr' && nameFr ? nameFr : name) || t('products.preview.placeholderName')
  const style = getCategoryStyle(category)
  const inStock = available && stock > 0

  return (
    <div className="sticky top-6">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-foreground-tertiary">
        {t('products.preview.label')}
      </p>
      <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_8px_30px_rgba(15,110,86,0.08)]">
        <div
          className="relative flex h-44 items-center justify-center overflow-hidden"
          style={
            coverImage
              ? undefined
              : {
                  background: `linear-gradient(145deg, ${style.from}22, ${style.to}44, ${style.accent})`,
                }
          }
        >
          {coverImage ? (
            <img src={coverImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <Package size={48} className="text-primary/35" strokeWidth={1.25} />
          )}
          <span
            className={cn(
              'absolute start-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold shadow-sm',
              inStock ? 'bg-primary text-white' : 'bg-[#FCEBEB] text-[#791F1F]',
            )}
          >
            {inStock ? t('products.inStock') : t('products.outOfStock')}
          </span>
        </div>
        <div className="p-4">
          <p className="line-clamp-2 font-medium leading-snug text-foreground">{displayName}</p>
          <p className="mt-1 text-xs text-foreground-tertiary">{category || '—'}</p>
          <p className="mt-3 text-xl font-semibold tabular-nums text-primary">
            {priceDzd > 0 ? formatDzd(priceDzd, locale) : '—'}
          </p>
          <div className="mt-2 flex justify-between text-xs text-foreground-tertiary">
            <span className="font-mono" dir="ltr">
              {sku || 'SKU'}
            </span>
            {stock > 0 && (
              <span>
                {stock} {t('products.units')}
              </span>
            )}
          </div>
        </div>
      </article>
      <p className="mt-3 text-center text-[11px] text-foreground-tertiary">
        {t('products.preview.hint')}
      </p>
    </div>
  )
}
