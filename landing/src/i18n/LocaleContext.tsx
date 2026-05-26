import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Locale = 'ar' | 'fr'

type LocaleContextValue = {
  locale: Locale
  setLocale: (l: Locale) => void
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'ar',
  setLocale: () => {},
})

const STORAGE_KEY = 'crido_locale'

function readInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'ar'
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'ar' || stored === 'fr') return stored
  } catch {
    /* ignore (e.g. private mode) */
  }
  // Try browser language as a hint, default to Arabic.
  const browser = (navigator.language || '').toLowerCase()
  if (browser.startsWith('fr')) return 'fr'
  return 'ar'
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale)

  useEffect(() => {
    const html = document.documentElement
    html.lang = locale
    html.dir = locale === 'ar' ? 'rtl' : 'ltr'
    try {
      window.localStorage.setItem(STORAGE_KEY, locale)
    } catch {
      /* ignore */
    }
  }, [locale])

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale: setLocaleState }),
    [locale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  return useContext(LocaleContext)
}
