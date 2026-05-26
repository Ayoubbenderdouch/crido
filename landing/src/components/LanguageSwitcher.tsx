import { useLocale, type Locale } from '@/i18n/LocaleContext'

const OPTIONS: { value: Locale; label: string }[] = [
  { value: 'ar', label: 'AR' },
  { value: 'fr', label: 'FR' },
]

export function LanguageSwitcher({ scrolled = false }: { scrolled?: boolean }) {
  const { locale, setLocale } = useLocale()

  return (
    <div
      role="group"
      aria-label="Language switcher"
      className={`relative inline-flex shrink-0 items-center rounded-full p-0.5 text-[0.72rem] font-bold transition-colors ${
        scrolled
          ? 'bg-cream-deep'
          : 'bg-white/10 ring-1 ring-white/15 backdrop-blur'
      }`}
    >
      {OPTIONS.map((opt) => {
        const active = locale === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setLocale(opt.value)}
            aria-pressed={active}
            className={`latin relative z-10 inline-flex h-7 w-9 items-center justify-center rounded-full transition-colors ${
              active
                ? scrolled
                  ? 'bg-teal text-white shadow-sm'
                  : 'bg-white text-teal'
                : scrolled
                  ? 'text-ink-soft hover:text-ink'
                  : 'text-white/85 hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
