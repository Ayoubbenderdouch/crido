import { useTranslation } from 'react-i18next'
import { Receipt } from 'lucide-react'
import type { MerchantPayout } from '@/lib/mock/data'
import type { PayoutBankDetails } from '@/lib/payoutBankDetails'
import { formatDzd, formatDate, type Locale } from '@/lib/format'
import { CcpPayoutProof } from './CcpPayoutProof'
import { BaridiMobPayoutProof } from './BaridiMobPayoutProof'

type Props = {
  payout: MerchantPayout
  bankDetails: PayoutBankDetails
  locale: Locale
  transferRef?: string | null
  compact?: boolean
}

export function defaultPayoutTransferRef(method: MerchantPayout['method'], ref: string): string {
  if (method === 'ccp_transfer') return `CCP-${ref.slice(-6)}`
  if (method === 'baridi_mob') return `BM-${ref.slice(-6)}`
  return `CASH-${ref.slice(-6)}`
}

export function PayoutProofPreview({
  payout,
  bankDetails,
  locale,
  transferRef,
  compact = false,
}: Props) {
  const { t } = useTranslation()
  const ref = transferRef || defaultPayoutTransferRef(payout.method, payout.reference)
  const paidAt = payout.paidAt ?? payout.createdAt

  if (payout.method === 'ccp_transfer') {
    return (
      <CcpPayoutProof
        amountDzd={payout.amountDzd}
        merchantName={payout.merchantName}
        ccpAccount={bankDetails.ccpAccount ?? '0000000000000000000000'}
        transferRef={ref}
        paidAt={paidAt}
        locale={locale}
        compact={compact}
      />
    )
  }

  if (payout.method === 'baridi_mob') {
    return (
      <BaridiMobPayoutProof
        amountDzd={payout.amountDzd}
        merchantName={payout.merchantName}
        baridiRip={bankDetails.baridiRip ?? '—'}
        transferRef={ref}
        paidAt={paidAt}
        locale={locale}
        compact={compact}
      />
    )
  }

  return (
    <div className={`flex justify-center ${compact ? 'py-2' : 'p-6'}`}>
      <div
        className={`w-full max-w-[280px] rounded-2xl border-2 border-dashed border-warning/40 bg-warning/5 ${compact ? 'px-3 py-4' : 'px-5 py-6'}`}
      >
        <Receipt size={compact ? 28 : 36} className="mx-auto text-warning" />
        <p className="mt-3 text-center text-sm font-semibold text-foreground">
          {t('payouts.detail.cashProofTitle')}
        </p>
        <p className="mt-1 text-center text-xs text-foreground-secondary">
          {bankDetails.cashContact} · {formatDzd(payout.amountDzd, locale)}
        </p>
        <p className="mt-2 text-center font-mono text-xs text-foreground-tertiary" dir="ltr">
          {ref} · {formatDate(paidAt, locale)}
        </p>
      </div>
    </div>
  )
}
