import type { ReactNode } from 'react'
import { Reveal } from './Reveal'

const NAV_LINKS = [
  { href: '#how', label: 'كيف تعمل' },
  { href: '#why', label: 'لماذا Crido' },
  { href: '#plans', label: 'الخطط' },
  { href: '#merchants', label: 'للتجار' },
]

/** Apple logo silhouette. */
function AppleLogo() {
  return (
    <svg viewBox="0 0 384 512" width="23" height="23" fill="currentColor" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM262.1 104.5c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  )
}

/** Google Play four-colour triangle. */
function GooglePlayLogo() {
  return (
    <svg viewBox="0 0 26 24" width="21" height="21" aria-hidden="true">
      <polygon points="5,2.6 5,12 11,12" fill="#00C3F7" />
      <polygon points="5,12 5,21.4 11,12" fill="#FF424B" />
      <polygon points="5,2.6 22,12 11,12" fill="#22C55E" />
      <polygon points="5,21.4 22,12 11,12" fill="#FFC72C" />
    </svg>
  )
}

function StoreButton({ icon, small, big }: { icon: ReactNode; small: string; big: string }) {
  return (
    <a
      href="#download"
      className="inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-3 text-teal-deep transition-transform hover:scale-[1.03]"
    >
      <span className="flex w-6 justify-center">{icon}</span>
      <span className="leading-tight">
        <span className="block text-[11px] text-ink-soft">{small}</span>
        <span className="block text-sm font-bold">{big}</span>
      </span>
    </a>
  )
}

export function Footer() {
  return (
    <footer id="download" className="bg-teal-night text-white">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="border-b border-white/10 py-20 text-center md:py-24">
            <h2 className="mx-auto max-w-xl text-3xl font-bold leading-tight md:text-[2.7rem]">
              ابدأ التقسيط اليوم.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-teal-surface/70">
              حمّل تطبيق Crido، وقدّم أول طلب تمويل لك خلال دقائق.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <StoreButton icon={<AppleLogo />} small="حمّله على" big="App Store" />
              <StoreButton icon={<GooglePlayLogo />} small="احصل عليه من" big="Google Play" />
            </div>
          </div>
        </Reveal>

        <div className="grid gap-10 py-14 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/crido-logo.png" alt="" className="h-9 w-9 rounded-xl" />
              <span className="text-xl font-bold">Crido</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-teal-surface/60">
              منصّة تقسيط جزائرية تتيح لك الشراء من أي متجر في أدرار والدفع شهرياً —
              بدون فوائد.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">المنصّة</p>
            <ul className="mt-4 space-y-3">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-sm text-teal-surface/60 transition-colors hover:text-white"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">تواصل</p>
            <ul className="mt-4 space-y-3 text-sm text-teal-surface/60">
              <li>أدرار، الجزائر</li>
              <li className="latin" dir="ltr">hello@crido.dz</li>
              <li>الأحد — الخميس</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-7 text-sm text-teal-surface/50 sm:flex-row">
          <p>© 2026 Crido — قسّطها بسهولة.</p>
          <p>صُنع في الجزائر 🇩🇿</p>
        </div>
      </div>
    </footer>
  )
}
