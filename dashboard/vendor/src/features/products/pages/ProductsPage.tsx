import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Package, Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/data/Loader'
import { fetchProducts } from '@/lib/api'
import { formatDzd, type Locale } from '@/lib/format'
import { getCategoryStyle, getProductCover } from '@/lib/productVisuals'
import { cn } from '@/lib/utils'

export default function ProductsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const { data, isLoading } = useQuery({ queryKey: ['products'], queryFn: fetchProducts })

  return (
    <div className="animate-fade-up">
      <PageHeader title={t('products.title')} subtitle={t('products.subtitle')}>
        <Link to="/products/new">
          <Button size="sm" type="button" className="shadow-sm">
            <Plus size={15} />
            {t('products.addProduct')}
          </Button>
        </Link>
      </PageHeader>

      {isLoading || !data ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((p) => {
            const inStock = (p.stock ?? 0) > 0 && p.available
            const displayName = locale === 'fr' && p.nameFr ? p.nameFr : p.name
            const cover = getProductCover(p)
            const catStyle = getCategoryStyle(p.category)

            return (
              <Link key={p.id} to={`/products/${p.id}`} className="group block">
                <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg">
                  <div className="relative flex h-36 items-center justify-center overflow-hidden">
                    {cover ? (
                      <img
                        src={cover}
                        alt=""
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(145deg, ${catStyle.from}28, ${catStyle.to}55, ${catStyle.accent})`,
                        }}
                      />
                    )}
                    {!cover && (
                      <Package
                        size={44}
                        strokeWidth={1.25}
                        className="relative text-primary/40 transition group-hover:scale-110"
                      />
                    )}
                    <span
                      className={cn(
                        'absolute start-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold shadow-sm backdrop-blur-sm',
                        inStock
                          ? 'bg-primary/95 text-white'
                          : 'bg-white/90 text-[#791F1F]',
                      )}
                    >
                      {inStock ? t('products.inStock') : t('products.outOfStock')}
                    </span>
                    {(p.gallery?.length ?? 0) > 0 && (
                      <span className="absolute bottom-3 end-3 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                        +{p.gallery!.length} {t('products.images.more')}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="line-clamp-2 font-medium leading-snug text-foreground group-hover:text-primary">
                      {displayName}
                    </p>
                    <p className="mt-1 text-xs text-foreground-tertiary">{p.category}</p>
                    <p className="mt-3 text-lg font-semibold tabular-nums text-primary">
                      {formatDzd(p.priceDzd, locale)}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs text-foreground-tertiary">
                      <span className="font-mono" dir="ltr">
                        {p.sku}
                      </span>
                      {p.stock != null && (
                        <span className="tabular-nums">
                          {p.stock} {t('products.units')}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
