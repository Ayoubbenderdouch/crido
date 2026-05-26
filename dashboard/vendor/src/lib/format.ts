import dayjs from 'dayjs'
import 'dayjs/locale/ar'
import 'dayjs/locale/fr'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

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

/** Relative time — Arabic/French via dayjs locales. */
export function formatRelative(date: string | Date, locale: Locale = 'ar'): string {
  return dayjs(date).locale(locale).fromNow()
}
