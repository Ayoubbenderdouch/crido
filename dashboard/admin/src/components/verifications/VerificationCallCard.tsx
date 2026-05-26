import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  PhoneCall,
  MapPin,
  Store,
  User,
  ChevronLeft,
  Package,
  Smartphone,
  Laptop,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/data/Avatar'
import type { VerificationItem } from '@/lib/mock/data'
import { ProductThumbnail } from '@/components/data/ProductThumbnail'
import { getProductVisual } from '@/lib/productVisuals'
import { formatDzd, formatDate, type Locale } from '@/lib/format'
import { cn } from '@/lib/utils'

type Props = {
  item: VerificationItem
  locale: Locale
  onOpen?: () => void
}

export function VerificationCallCard({ item, locale, onOpen }: Props) {
  const { t } = useTranslation()
  const visual = getProductVisual(item.productName)
  const monthly = Math.round(item.amountDzd / item.planMonths)
  const CategoryIcon = visual.category === 'pc' ? Laptop : visual.category === 'phone' ? Smartphone : Package
  const categoryLabel =
    visual.category === 'pc'
      ? t('verifications.categoryPc')
      : visual.category === 'phone'
        ? t('verifications.categoryPhone')
        : null

  return (
    <Card
      className="group overflow-hidden transition hover:border-primary/30 hover:shadow-md"
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (onOpen && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onOpen()
        }
      }}
    >
      <div className="flex flex-col gap-0 sm:flex-row">
        {/* Product hero */}
        <div
          className={cn(
            'relative flex w-full shrink-0 flex-col justify-between bg-gradient-to-br p-4 sm:w-[200px]',
            visual.accentClass,
          )}
        >
          <div className="relative overflow-hidden rounded-xl border border-white/60 bg-white shadow-sm transition duration-300 group-hover:scale-[1.02]">
            <ProductThumbnail productName={item.productName} />
            {categoryLabel ? (
              <span className="absolute bottom-2 start-2 flex items-center gap-1 rounded-md bg-foreground/75 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                <CategoryIcon size={11} />
                {categoryLabel}
              </span>
            ) : null}
          </div>
          <div className="mt-3 sm:mt-4">
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
              <Package size={12} />
              {t('verifications.product')}
            </p>
            <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
              {item.productName}
            </p>
            <p className="mt-2 text-xl font-bold tabular-nums text-foreground">
              {formatDzd(item.amountDzd, locale)}
            </p>
            <p className="text-xs text-foreground-tertiary">
              {t('verifications.monthly', { amount: formatDzd(monthly, locale), months: item.planMonths })}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-foreground-tertiary">{t('verifications.columns.request')}</p>
              <p className="font-semibold tabular-nums text-foreground">{item.requestRef}</p>
              <p className="mt-0.5 text-xs text-foreground-tertiary">
                {formatDate(item.submittedAt, locale)}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition group-hover:opacity-100">
              {t('common.view')}
              <ChevronLeft size={14} className="ltr:rotate-180" />
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-background-secondary/40 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground-secondary">
                <Store size={14} className="text-primary" />
                {t('verifications.columns.merchant')}
              </p>
              <Link
                to={`/merchants/ad-hoc/${item.requestRef}`}
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-foreground hover:text-primary hover:underline"
              >
                {item.proposedMerchantName}
              </Link>
              <p className="mt-1 flex items-start gap-1 text-xs text-foreground-tertiary">
                <MapPin size={12} className="mt-0.5 shrink-0" />
                {item.proposedMerchantAddress}
              </p>
              <p className="mt-1 text-xs tabular-nums text-foreground-secondary" dir="ltr">
                {item.proposedMerchantPhone}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background-secondary/40 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground-secondary">
                <User size={14} className="text-info" />
                {t('verifications.columns.client')}
              </p>
              <div className="flex items-center gap-2">
                <Avatar name={item.clientName} size={32} />
                <span className="font-semibold text-foreground">{item.clientName}</span>
              </div>
              <p className="mt-2 text-xs tabular-nums text-foreground-tertiary" dir="ltr">
                {item.clientPhone}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3">
            <Link
              to={`/financing-requests/${item.requestRef}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-medium text-foreground-secondary hover:text-primary"
            >
              {t('verifications.openRequest')}
            </Link>
            <a href={`tel:${item.proposedMerchantPhone}`} onClick={(e) => e.stopPropagation()}>
              <Button size="sm" className="gap-2 shadow-sm">
                <PhoneCall size={16} />
                {t('verifications.callNow')}
              </Button>
            </a>
          </div>
        </div>
      </div>
    </Card>
  )
}
