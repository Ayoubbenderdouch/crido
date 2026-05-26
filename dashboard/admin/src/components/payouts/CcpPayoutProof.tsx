import { CheckCircle2 } from 'lucide-react'
import { formatDzd, formatDate, type Locale } from '@/lib/format'

type Props = {
  amountDzd: number
  merchantName: string
  ccpAccount: string
  transferRef: string
  paidAt: string
  locale: Locale
  compact?: boolean
}

/** Maquette reçu virement CCP — Crido vers marchand. */
export function CcpPayoutProof({
  amountDzd,
  merchantName,
  ccpAccount,
  transferRef,
  paidAt,
  locale,
  compact = false,
}: Props) {
  const amount = formatDzd(amountDzd, locale).replace(' دج', ' DA')
  const date = formatDate(paidAt, locale)
  const accountTail = ccpAccount.slice(-8)

  return (
    <div className={compact ? 'flex justify-center py-2' : 'flex justify-center p-4'}>
      <div
        className={
          compact
            ? 'w-full max-w-[240px] overflow-hidden rounded-xl border border-[#0c447c]/20 bg-white shadow-md'
            : 'w-full max-w-[300px] overflow-hidden rounded-2xl border border-[#0c447c]/25 bg-white shadow-[0_20px_40px_-12px_rgba(12,68,124,0.25)]'
        }
        dir="ltr"
      >
        <div className="bg-gradient-to-r from-[#0c447c] to-[#1565a8] px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-[10px] font-bold">
              CCP
            </span>
            <div>
              <p className="text-sm font-semibold">Algérie Poste</p>
              <p className="text-[10px] text-white/80">Compte CCP · بريد الجزائر</p>
            </div>
          </div>
        </div>

        <div className={compact ? 'px-3 py-4' : 'px-4 py-6'}>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={compact ? 20 : 28} className="text-[#1D9E75]" />
            <div>
              <p className="text-sm font-semibold text-[#1D9E75]">Virement effectué</p>
              <p className="text-[10px] text-[#666]">تم التحويل بنجاح</p>
            </div>
          </div>

          <p className={compact ? 'mt-3 text-2xl font-bold text-[#1a1a1a]' : 'mt-5 text-center text-3xl font-bold text-[#1a1a1a]'}>
            {amount}
          </p>
          <p className="text-center text-[10px] text-[#888]">Montant versé au marchand</p>

          <div className={`mt-4 space-y-2 rounded-lg bg-[#f4f8fc] text-xs ${compact ? 'px-2.5 py-2' : 'px-3 py-3'}`}>
            <div className="flex justify-between gap-2 border-b border-[#dde8f2] pb-1.5">
              <span className="text-[#888]">Émetteur</span>
              <span className="font-medium text-[#333]">Crido SARL</span>
            </div>
            <div className="flex justify-between gap-2 border-b border-[#dde8f2] pb-1.5">
              <span className="text-[#888]">Bénéficiaire</span>
              <span className="max-w-[130px] truncate font-semibold text-[#0c447c]">{merchantName}</span>
            </div>
            <div className="flex justify-between gap-2 border-b border-[#dde8f2] pb-1.5">
              <span className="text-[#888]">Compte</span>
              <span className="font-mono text-[#333]">····{accountTail}</span>
            </div>
            <div className="flex justify-between gap-2 border-b border-[#dde8f2] pb-1.5">
              <span className="text-[#888]">Réf.</span>
              <span className="font-mono font-semibold text-[#333]">{transferRef}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-[#888]">Date</span>
              <span className="font-medium text-[#333]">{date}</span>
            </div>
          </div>

          {!compact ? (
            <p className="mt-3 text-center text-[10px] text-[#aaa]">
              Reçu de démonstration — preuve de versement marchand
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
