import { BadgeCheck, BadgePercent, MapPin, Zap } from 'lucide-react'
import { useT } from '@/i18n/useT'

const TR = {
  ar: {
    aria: 'ضمانات Crido',
    item1: 'بدون أي فوائد',
    item2: 'متوافق مع الشريعة',
    item3: 'موافقة سريعة',
    item4: 'متوفّر في أدرار',
  },
  fr: {
    aria: 'Garanties Crido',
    item1: 'Zéro intérêt',
    item2: 'Conforme à la Charia',
    item3: 'Approbation rapide',
    item4: 'Disponible à Adrar',
  },
} as const

const ITEMS = [
  { icon: BadgePercent, key: 'item1' as const },
  { icon: BadgeCheck, key: 'item2' as const },
  { icon: Zap, key: 'item3' as const },
  { icon: MapPin, key: 'item4' as const },
]

/** Thin trust signal bar that sits right below the Hero. */
export function TrustStrip() {
  const t = useT(TR)

  return (
    <section
      aria-label={t('aria')}
      className="border-y border-line bg-cream"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <ul className="grid grid-cols-2 gap-y-5 py-5 sm:grid-cols-4 sm:gap-y-4 sm:divide-x sm:divide-line sm:rtl:divide-x-reverse sm:py-5 md:py-6">
          {ITEMS.map((item) => (
            <li
              key={item.key}
              className="flex items-center justify-center gap-2 px-2 text-center sm:gap-2.5 sm:justify-start sm:px-4 sm:text-start"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-surface text-teal sm:h-9 sm:w-9">
                <item.icon size={16} strokeWidth={2} className="sm:hidden" />
                <item.icon size={18} strokeWidth={2} className="hidden sm:block" />
              </span>
              <span className="text-[0.8rem] font-medium leading-snug text-ink-soft sm:text-sm md:text-[0.95rem]">
                {t(item.key)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
