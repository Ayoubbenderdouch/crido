import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useT } from '@/i18n/useT'

const STORAGE_KEY = 'crido_banner_dismissed'

const TR = {
  ar: {
    region: 'تحميل تطبيق Crido',
    title: 'حمّل تطبيق Crido',
    subtitle: 'ابدأ في 5 دقائق · مجاناً',
    appStore: 'حمّله من App Store',
    googlePlay: 'احصل عليه من Google Play',
    close: 'إغلاق',
  },
  fr: {
    region: "Téléchargement de l'app Crido",
    title: "Téléchargez l'app Crido",
    subtitle: 'Commencez en 5 minutes · Gratuit',
    appStore: 'Téléchargez sur App Store',
    googlePlay: 'Disponible sur Google Play',
    close: 'Fermer',
  },
} as const

/** Apple logo silhouette */
function AppleGlyph() {
  return (
    <svg viewBox="0 0 384 512" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM262.1 104.5c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  )
}

/** Google Play four-colour triangle */
function PlayGlyph() {
  return (
    <svg viewBox="0 0 26 24" className="h-4 w-4" aria-hidden="true">
      <polygon points="5,2.6 5,12 11,12" fill="#00C3F7" />
      <polygon points="5,12 5,21.4 11,12" fill="#FF424B" />
      <polygon points="5,2.6 22,12 11,12" fill="#22C55E" />
      <polygon points="5,21.4 22,12 11,12" fill="#FFC72C" />
    </svg>
  )
}

/**
 * Floating banner that nudges users toward downloading the app.
 * Mobile: full-width pill above the iOS home indicator (safe-area aware).
 * Desktop: anchored to the bottom-end corner.
 */
export function StickyDownloadBanner() {
  const t = useT(TR)
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
      setDismissed(true)
      return
    }
    const onScroll = () => {
      if (window.scrollY > 600) setVisible(true)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (dismissed || !visible) return null

  const dismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      /* ignore storage errors (private mode) */
    }
  }

  return (
    <div
      role="region"
      aria-label={t('region')}
      className="fixed inset-x-3 z-40 animate-[rise_0.6s_cubic-bezier(0.22,0.7,0.2,1)] sm:inset-x-4 md:inset-x-auto md:end-6 md:w-[400px]"
      style={{
        bottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-teal-deep shadow-[0_30px_60px_-22px_rgba(4,36,30,0.55)] ring-1 ring-white/10">
        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute -end-12 -top-12 h-32 w-32 rounded-full bg-teal-bright/15 blur-3xl" />

        {/* Close — placed inside the banner top-end corner */}
        <button
          type="button"
          onClick={dismiss}
          aria-label={t('close')}
          className="absolute end-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/8 text-teal-surface/70 transition-colors hover:bg-white/15 hover:text-white"
        >
          <X size={13} strokeWidth={2.4} />
        </button>

        <div className="relative p-4 pe-12 sm:p-5 sm:pe-14">
          {/* Top row — brand mark + headline */}
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-bright/20 ring-1 ring-teal-bright/30">
              <span className="text-base font-bold text-teal-bright leading-none">C</span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-semibold leading-tight text-white sm:text-sm">
                {t('title')}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-teal-surface/70 sm:text-xs">
                <span className="inline-block h-1 w-1 rounded-full bg-teal-bright" />
                {t('subtitle')}
              </p>
            </div>
          </div>

          {/* Store badges row */}
          <div className="mt-3.5 grid grid-cols-2 gap-2">
            <a
              href="#download"
              aria-label={t('appStore')}
              className="group inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white text-ink transition-all duration-200 hover:bg-cream active:scale-[0.98]"
            >
              <AppleGlyph />
              <span className="latin text-[12.5px] font-bold leading-none">App Store</span>
            </a>
            <a
              href="#download"
              aria-label={t('googlePlay')}
              className="group inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white text-ink transition-all duration-200 hover:bg-cream active:scale-[0.98]"
            >
              <PlayGlyph />
              <span className="latin text-[12.5px] font-bold leading-none">Google Play</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
