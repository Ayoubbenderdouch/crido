import { CheckCircle2 } from 'lucide-react'
import { formatDzd, formatDate, type Locale } from '@/lib/format'

type Props = {
  amountDzd: number
  externalRef: string
  clientName: string
  submittedAt: string
  locale: Locale
}

/** Stylized Baridi Mob transfer receipt — demo proof for admin verification. */
export function BaridiMobProof({ amountDzd, externalRef, clientName, submittedAt, locale }: Props) {
  const amount = formatDzd(amountDzd, locale).replace(' دج', ' DA')
  const date = formatDate(submittedAt, locale)

  return (
    <div className="flex justify-center p-4">
      <div
        className="w-full max-w-[280px] overflow-hidden rounded-[28px] border-[6px] border-[#1a1a1a] bg-[#f4f4f6] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.35)]"
        dir="ltr"
      >
        {/* Status bar */}
        <div className="flex items-center justify-between bg-[#f4f4f6] px-5 pt-2.5 text-[10px] font-medium text-[#1a1a1a]">
          <span>9:41</span>
          <div className="flex gap-1">
            <span className="h-2.5 w-3.5 rounded-sm bg-[#1a1a1a]/80" />
            <span className="h-2.5 w-3 rounded-sm bg-[#1a1a1a]/80" />
          </div>
        </div>

        {/* App header */}
        <div className="bg-[#5c2d91] px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-xs font-bold">
              BM
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight">Baridi Mob</p>
              <p className="text-[10px] text-white/75">بريدي موب</p>
            </div>
          </div>
        </div>

        {/* Success screen */}
        <div className="bg-white px-4 pb-6 pt-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f8ef]">
            <CheckCircle2 size={32} className="text-[#22a06b]" strokeWidth={2} />
          </div>
          <p className="mt-4 text-sm font-semibold text-[#22a06b]">Opération réussie</p>
          <p className="mt-0.5 text-xs text-[#666]">تمت العملية بنجاح</p>

          <p className="mt-6 text-3xl font-bold tracking-tight text-[#1a1a1a]">{amount}</p>
          <p className="mt-1 text-xs text-[#888]">Montant transféré</p>

          <div className="mt-6 space-y-2.5 rounded-xl bg-[#f8f8fa] px-3 py-3 text-start text-xs">
            <div className="flex justify-between gap-2 border-b border-[#eee] pb-2">
              <span className="text-[#888]">Référence</span>
              <span className="font-semibold tabular-nums text-[#333]">{externalRef}</span>
            </div>
            <div className="flex justify-between gap-2 border-b border-[#eee] pb-2">
              <span className="text-[#888]">Bénéficiaire</span>
              <span className="max-w-[140px] truncate font-medium text-[#333]">Crido SARL</span>
            </div>
            <div className="flex justify-between gap-2 border-b border-[#eee] pb-2">
              <span className="text-[#888]">Expéditeur</span>
              <span className="max-w-[140px] truncate font-medium text-[#333]">{clientName}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-[#888]">Date</span>
              <span className="font-medium text-[#333]">{date}</span>
            </div>
          </div>

          <p className="mt-4 text-[10px] leading-relaxed text-[#aaa]">
            Cette capture est une maquette de démonstration pour la vérification admin.
          </p>
        </div>

        {/* Home indicator */}
        <div className="flex justify-center bg-white pb-2 pt-1">
          <span className="h-1 w-24 rounded-full bg-[#1a1a1a]/20" />
        </div>
      </div>
    </div>
  )
}
