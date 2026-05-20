import { Apple, Play } from 'lucide-react'
import { Reveal } from './Reveal'

const NAV_LINKS = [
  { href: '#how', label: 'كيف تعمل' },
  { href: '#why', label: 'لماذا Crido' },
  { href: '#plans', label: 'الخطط' },
  { href: '#merchants', label: 'للتجار' },
]

function StoreButton({ icon, small, big }: { icon: React.ReactNode; small: string; big: string }) {
  return (
    <a
      href="#download"
      className="inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-3 text-teal-deep transition-transform hover:scale-[1.03]"
    >
      {icon}
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
              <StoreButton icon={<Apple size={24} />} small="حمّله على" big="App Store" />
              <StoreButton icon={<Play size={22} />} small="احصل عليه من" big="Google Play" />
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
