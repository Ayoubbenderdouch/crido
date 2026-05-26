import dayjs from 'dayjs'
import 'dayjs/locale/fr'

export type Locale = 'ar' | 'fr'

// Algerian/Maghrebi Arabic month names (Western calendar) — see docs/ALGERIA_CONTEXT.md
const AR_MONTHS_DZ = [
  'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان',
  'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
]

/** Format an amount in Algerian Dinar. Arabic uses Western digits + `دج`. */
export function formatDzd(amount: number, locale: Locale = 'ar'): string {
  const n = new Intl.NumberFormat(locale === 'ar' ? 'en-US' : 'fr-FR', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount))
  return locale === 'ar' ? `${n} دج` : `${n} DZD`
}

/** Compact number with thousands separator, no currency suffix. */
export function formatNumber(value: number, locale: Locale = 'ar'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'en-US' : 'fr-FR').format(value)
}

/** Localized date — Arabic `15 جانفي 2026`, French `15/01/2026`. */
export function formatDate(iso: string, locale: Locale = 'ar'): string {
  const d = dayjs(iso)
  if (locale === 'ar') return `${d.date()} ${AR_MONTHS_DZ[d.month()]} ${d.year()}`
  return d.locale('fr').format('DD/MM/YYYY')
}

/** Relative-ish day count helper for "X days late" style labels. */
export function daysBetween(fromIso: string, toIso: string = new Date().toISOString()): number {
  return dayjs(toIso).startOf('day').diff(dayjs(fromIso).startOf('day'), 'day')
}

/** Human tenure since join date — e.g. "5 أشهر" / "5 mois". */
export function formatTenure(joinedAt: string, locale: Locale = 'ar', anchor = '2026-05-20'): string {
  const days = daysBetween(joinedAt, anchor)
  if (days < 1) return locale === 'ar' ? 'اليوم' : "Aujourd'hui"
  if (days < 30) {
    return locale === 'ar' ? `${days} يوم` : `${days} j`
  }
  const months = Math.max(1, Math.round(days / 30))
  if (months < 12) {
    return locale === 'ar' ? `${months} شهر` : `${months} mois`
  }
  const years = Math.floor(months / 12)
  const rem = months % 12
  if (locale === 'ar') {
    return rem > 0 ? `${years} سنة و ${rem} شهر` : `${years} سنة`
  }
  return rem > 0 ? `${years} an${years > 1 ? 's' : ''} ${rem} mois` : `${years} an${years > 1 ? 's' : ''}`
}
