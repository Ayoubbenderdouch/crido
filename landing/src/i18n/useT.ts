import { useLocale, type Locale } from './LocaleContext'

type Bundle<K extends string> = Record<K, string>

/**
 * Component-local translation hook.
 *
 * Each component owns its own translations:
 *
 * ```tsx
 * const TR = {
 *   ar: { title: 'مرحبا', cta: 'ابدأ' },
 *   fr: { title: 'Bonjour', cta: 'Commencer' },
 * } as const
 *
 * function Hero() {
 *   const t = useT(TR)
 *   return <h1>{t('title')}</h1>
 * }
 * ```
 *
 * If a key is missing in the active locale, falls back to Arabic.
 */
export function useT<K extends string>(translations: { ar: Bundle<K>; fr: Bundle<K> }) {
  const { locale } = useLocale()
  return (key: K): string =>
    translations[locale]?.[key] ?? translations.ar?.[key] ?? String(key)
}

/** Read the current locale without subscribing to translations. */
export function useCurrentLocale(): Locale {
  return useLocale().locale
}

/** Locale-aware currency suffix for DZD. */
export function dzdSuffix(locale: Locale): string {
  return locale === 'ar' ? 'دج' : 'DZD'
}

/** Format an integer with the right thousands separator for the locale. */
export function fmtMoney(amount: number, locale: Locale): string {
  if (locale === 'fr') {
    // 200 000 DZD (narrow no-break space)
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
      .format(Math.round(amount))
      .replace(/ | /g, ' ')
  }
  // 200,000 دج (Algerian convention uses Western digits with comma)
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(
    Math.round(amount),
  )
}
