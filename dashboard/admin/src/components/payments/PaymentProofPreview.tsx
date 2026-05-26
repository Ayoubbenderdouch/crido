import { Banknote } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Payment } from '@/lib/mock/data'
import type { Locale } from '@/lib/format'
import { BaridiMobProof } from './BaridiMobProof'

type Props = {
  payment: Payment
  locale: Locale
}

export function PaymentProofPreview({ payment, locale }: Props) {
  const { t } = useTranslation()

  if (payment.method === 'baridi_mob') {
    return (
      <BaridiMobProof
        amountDzd={payment.amountDzd}
        externalRef={payment.externalRef}
        clientName={payment.clientName}
        submittedAt={payment.submittedAt}
        locale={locale}
      />
    )
  }

  return (
    <div className="flex min-h-[280px] items-center justify-center bg-background-secondary/40 p-6">
      <div className="text-center">
        <div className="mx-auto flex h-24 w-40 items-center justify-center rounded-xl border-2 border-dashed border-border bg-background">
          <Banknote size={32} className="text-foreground-tertiary" />
        </div>
        <p className="mt-3 text-sm text-foreground-secondary">
          {t('payments.detail.proofDemo')}
        </p>
        <p className="mt-1 text-xs text-foreground-tertiary" dir="ltr">
          {payment.externalRef} · {t(`method.${payment.method}`)}
        </p>
      </div>
    </div>
  )
}
