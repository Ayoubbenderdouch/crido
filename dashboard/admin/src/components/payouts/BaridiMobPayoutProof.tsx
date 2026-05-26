import { CheckCircle2 } from 'lucide-react'
import { formatDzd, formatDate, type Locale } from '@/lib/format'

type Props = {
  amountDzd: number
  merchantName: string
  baridiRip: string
  transferRef: string
  paidAt: string
  locale: Locale
  compact?: boolean
}

export function BaridiMobPayoutProof({
  amountDzd,
  merchantName,
  baridiRip,
  transferRef,
  paidAt,
  locale,
  compact = false,
}: Props) {
  const amount = formatDzd(amountDzd, locale).replace(' دج', ' DA')
  const date = formatDate(paidAt, locale)

  return (
    <div className={compact ? 'flex justify-center py-2' : 'flex justify-center p-4'}>
      <div
        className={
          compact
            ? 'w-full max-w-[240px] overflow-hidden rounded-[20px] border-[4px] border-[#1a1a1a] bg-[#f4f4f6]'
            : 'w-full max-w-[280px] overflow-hidden rounded-[28px] border-[6px] border-[#1a1a1a] bg-[#f4f4f6] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.35)]'
        }
        dir="ltr"
      >
        <div className="bg-[#5c2d91] px-3 py-2.5 text-white">
          <p className="text-xs font-semibold">Baridi Mob · بريدي موب</p>
        </div>
        <div className="bg-white px-3 py-4 text-center">
          <CheckCircle2 size={compact ? 24 : 32} className="mx-auto text-[#22a06b]" />
          <p className="mt-2 text-xs font-semibold text-[#22a06b]">Versement marchand</p>
          <p className={compact ? 'mt-2 text-xl font-bold' : 'mt-4 text-3xl font-bold'}>{amount}</p>
          <div className="mt-3 space-y-1.5 rounded-lg bg-[#f8f8fa] px-2.5 py-2 text-start text-[10px]">
            <div className="flex justify-between gap-1">
              <span className="text-[#888]">De</span>
              <span className="font-medium">Crido</span>
            </div>
            <div className="flex justify-between gap-1">
              <span className="text-[#888]">Vers</span>
              <span className="truncate font-semibold text-[#5c2d91]">{merchantName}</span>
            </div>
            <div className="flex justify-between gap-1">
              <span className="text-[#888]">RIP</span>
              <span className="font-mono">{baridiRip}</span>
            </div>
            <div className="flex justify-between gap-1">
              <span className="text-[#888]">Réf.</span>
              <span className="font-mono font-semibold">{transferRef}</span>
            </div>
            <div className="flex justify-between gap-1">
              <span className="text-[#888]">Date</span>
              <span>{date}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
