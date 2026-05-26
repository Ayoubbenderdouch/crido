import { useTranslation } from 'react-i18next'
import { Store } from 'lucide-react'
import { Avatar } from '@/components/data/Avatar'
import { Link } from 'react-router'
import { merchantHref } from '@/lib/financingLookup'

type Props = {
  merchantName: string
  amountLabel?: string
  reference?: string
}

export function PayoutVendorBanner({ merchantName, amountLabel, reference }: Props) {
  const { t } = useTranslation()
  const href = merchantHref(merchantName)

  return (
    <div className="mb-4 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary-surface/40 px-3 py-2.5">
      <Avatar name={merchantName} size={40} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
          <Store size={12} />
          {t('payouts.detail.vendorLabel')}
        </p>
        {href ? (
          <Link to={href} className="truncate text-sm font-semibold text-foreground hover:text-primary hover:underline">
            {merchantName}
          </Link>
        ) : (
          <p className="truncate text-sm font-semibold text-foreground">{merchantName}</p>
        )}
        {reference ? (
          <p className="text-xs tabular-nums text-foreground-tertiary" dir="ltr">
            {reference}
          </p>
        ) : null}
      </div>
      {amountLabel ? (
        <p className="shrink-0 text-lg font-bold tabular-nums text-foreground">{amountLabel}</p>
      ) : null}
    </div>
  )
}
