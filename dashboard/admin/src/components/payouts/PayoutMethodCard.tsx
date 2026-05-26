import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Building2, Smartphone, Banknote, Copy, Check } from 'lucide-react'
import type { PayoutMethod } from '@/lib/mock/data'
import type { PayoutBankDetails } from '@/lib/payoutBankDetails'
import { cn } from '@/lib/utils'

const METHOD_META: Record<
  PayoutMethod,
  { Icon: typeof Building2; accent: string; bg: string }
> = {
  ccp_transfer: { Icon: Building2, accent: 'text-info', bg: 'from-info/10 to-background' },
  baridi_mob: { Icon: Smartphone, accent: 'text-[#5c2d91]', bg: 'from-[#5c2d91]/12 to-background' },
  cash_delivery: { Icon: Banknote, accent: 'text-warning', bg: 'from-warning/12 to-background' },
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value.replace(/\s/g, ''))
      setCopied(true)
      toast.success(t('payouts.detail.copied'))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t('common.noResults'))
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-xs text-foreground-tertiary">{label}</p>
        <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-foreground" dir="ltr">
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={() => void copy()}
        className="flex shrink-0 items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground-secondary transition hover:border-primary/40 hover:bg-primary-surface hover:text-primary"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? t('payouts.detail.copied') : t('payouts.detail.copy')}
      </button>
    </div>
  )
}

type Props = {
  method: PayoutMethod
  amountLabel: string
  details: PayoutBankDetails
}

export function PayoutMethodCard({ method, amountLabel, details }: Props) {
  const { t } = useTranslation()
  const { Icon, accent, bg } = METHOD_META[method]

  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border bg-gradient-to-br', bg)}>
      <div className="flex items-center gap-3 border-b border-border/80 px-5 py-4">
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-background shadow-sm', accent)}>
          <Icon size={20} />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">{t(`method.${method}`)}</p>
          <p className="text-xs text-foreground-tertiary">{t('payouts.detail.payVia')}</p>
        </div>
        <p className="ms-auto text-lg font-bold tabular-nums text-foreground">{amountLabel}</p>
      </div>
      <div className="space-y-2 p-4">
        {method === 'ccp_transfer' ? (
          <>
            <CopyRow label={t('payouts.detail.ccpAccount')} value={details.ccpAccount ?? '—'} />
            <CopyRow label={t('payouts.detail.ccpKey')} value={details.ccpKey ?? '—'} />
          </>
        ) : null}
        {method === 'baridi_mob' ? (
          <CopyRow label={t('payouts.detail.baridiRip')} value={details.baridiRip ?? '—'} />
        ) : null}
        {method === 'cash_delivery' ? (
          <>
            <CopyRow label={t('payouts.detail.cashContact')} value={details.cashContact ?? '—'} />
            <p className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground-secondary">
              {details.cashAddress}
            </p>
          </>
        ) : null}
        <p className="text-center text-xs text-foreground-tertiary">{t('payouts.detail.verifyBeforePay')}</p>
      </div>
    </div>
  )
}
