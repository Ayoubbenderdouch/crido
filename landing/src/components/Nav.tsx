import { asset } from '@/lib/asset'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useT } from '@/i18n/useT'
import { LanguageSwitcher } from './LanguageSwitcher'

const TR = {
  ar: {
    how: 'كيف تعمل',
    why: 'لماذا Crido',
    plans: 'الخطط',
    merchants: 'للتجار',
    download: 'حمّل التطبيق',
    open: 'فتح القائمة',
    close: 'إغلاق القائمة',
    menu: 'القائمة',
    availability: 'متوفّر على iOS و Android',
  },
  fr: {
    how: 'Comment ça marche',
    why: 'Pourquoi Crido',
    plans: 'Plans',
    merchants: 'Marchands',
    download: "Télécharger l'app",
    open: 'Ouvrir le menu',
    close: 'Fermer le menu',
    menu: 'Menu',
    availability: 'Disponible sur iOS et Android',
  },
} as const

const LINK_KEYS = [
  { href: '#how', key: 'how' as const },
  { href: '#why', key: 'why' as const },
  { href: '#plans', key: 'plans' as const },
  { href: '#merchants', key: 'merchants' as const },
]

export function Nav() {
  const t = useT(TR)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const onMobile = scrolled || open

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          scrolled
            ? 'border-b border-line bg-cream/90 backdrop-blur-md'
            : 'border-b border-transparent'
        }`}
      >
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-teal-bright/30 to-transparent transition-opacity duration-500 ${
            scrolled ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:gap-6 md:h-18 md:px-6">
          <a
            href="#top"
            className="flex items-center gap-2.5"
            onClick={() => setOpen(false)}
          >
            <img src={asset("/crido-logo.png")} alt="" className="h-8 w-8 rounded-xl md:h-9 md:w-9" />
            <span
              className={`text-lg font-bold transition-colors md:text-xl ${
                onMobile && !open ? 'text-teal' : scrolled ? 'text-teal' : 'text-white'
              }`}
            >
              Crido
            </span>
          </a>

          <div className="hidden items-center gap-9 md:flex">
            {LINK_KEYS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`text-sm font-medium transition-colors ${
                  scrolled ? 'text-ink-soft hover:text-teal' : 'text-white/75 hover:text-white'
                }`}
              >
                {t(l.key)}
              </a>
            ))}
          </div>

          {/* Right cluster — language switcher + CTA on desktop */}
          <div className="flex items-center gap-2 md:gap-3">
            <LanguageSwitcher scrolled={scrolled} />

            <a
              href="#download"
              className={`hidden rounded-full px-5 py-2.5 text-sm font-semibold transition-colors md:inline-flex ${
                scrolled
                  ? 'bg-teal text-white hover:bg-teal-deep'
                  : 'bg-white text-teal hover:bg-cream'
              }`}
            >
              {t('download')}
            </a>

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={t('open')}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors md:hidden ${
                scrolled
                  ? 'bg-teal-surface text-teal hover:bg-teal-surface/70'
                  : 'bg-white/10 text-white backdrop-blur-sm hover:bg-white/20'
              }`}
            >
              <Menu size={22} strokeWidth={2.2} />
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile menu overlay ─────────────────────────────── */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={t('menu')}
        className={`fixed inset-0 z-[60] md:hidden ${
          open ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-teal-night/80 backdrop-blur-md transition-opacity duration-300 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div
          className={`relative flex h-full w-full flex-col bg-teal-deep transition-all duration-300 ease-out ${
            open ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          }`}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative flex h-16 items-center justify-between px-5">
            <div className="flex items-center gap-2.5">
              <img src={asset("/crido-logo.png")} alt="" className="h-8 w-8 rounded-xl" />
              <span className="text-lg font-bold text-white">Crido</span>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('close')}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <X size={22} strokeWidth={2.2} />
              </button>
            </div>
          </div>

          <nav className="relative flex flex-1 flex-col px-6 pt-6">
            <ul className="space-y-1">
              {LINK_KEYS.map((l, i) => (
                <li
                  key={l.href}
                  style={{
                    transitionDelay: open ? `${80 + i * 50}ms` : '0ms',
                  }}
                  className={`transform transition-all duration-300 ${
                    open ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
                  }`}
                >
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-2xl px-4 py-4 text-2xl font-semibold text-white transition-colors hover:bg-white/[0.06]"
                  >
                    <span>{t(l.key)}</span>
                  </a>
                </li>
              ))}
            </ul>

            <div
              style={{ transitionDelay: open ? `${80 + LINK_KEYS.length * 50}ms` : '0ms' }}
              className={`mt-auto pb-10 transform transition-all duration-300 ${
                open ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
              }`}
            >
              <a
                href="#download"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center rounded-full bg-white px-6 py-4 text-base font-bold text-teal-deep shadow-lg shadow-black/20 transition-transform hover:scale-[1.02] active:scale-[0.99]"
              >
                {t('download')}
              </a>
              <p className="mt-4 text-center text-xs text-teal-surface/60">
                {t('availability')}
              </p>
            </div>
          </nav>
        </div>
      </div>
    </>
  )
}
