import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Package, Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/data/Loader'
import { cn } from '@/lib/utils'
import { fetchProducts } from '@/lib/mock/api'
import { formatDzd, type Locale } from '@/lib/format'

export default function ProductsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale

  const { data, isLoading } = useQuery({ queryKey: ['products'], queryFn: fetchProducts })

  return (
    <div className="animate-fade-up">
      <PageHeader title={t('products.title')} subtitle={t('products.subtitle')}>
        <Button size="sm" onClick={() => toast(t('common.actionDemo'))}>
          <Plus size={15} />
          {t('products.addProduct')}
        </Button>
      </PageHeader>

      {isLoading || !data ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => {
            const inStock = (p.stock ?? 0) > 0
            return (
              <Card key={p.id} className="overflow-hidden">
                <div className="flex h-32 items-center justify-center bg-primary-surface">
                  <Package size={40} strokeWidth={1.25} className="text-primary opacity-40" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-foreground">{p.name}</p>
                    <span
                      className={cn(
                        'shrink-0 rounded-sm px-2 py-0.5 text-xs font-medium',
                        inStock ? 'bg-primary-surface text-primary' : 'bg-[#FCEBEB] text-[#791F1F]',
                      )}
                    >
                      {inStock ? t('products.inStock') : t('products.outOfStock')}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-foreground-tertiary">{p.category}</p>
                  <p className="mt-2 text-lg font-medium tabular-nums text-primary">
                    {formatDzd(p.priceDzd, locale)}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs text-foreground-tertiary">
                    <span className="tabular-nums">{p.sku}</span>
                    {p.stock !== null ? (
                      <span className="tabular-nums">{p.stock} {t('products.units')}</span>
                    ) : null}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
