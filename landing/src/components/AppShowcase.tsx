import { asset } from '@/lib/asset'
import type { ReactNode } from 'react'
import { Bell, LineChart, Sparkles } from 'lucide-react'
import { useT } from '@/i18n/useT'
import { Reveal } from './Reveal'

const TR = {
  ar: {
    eyebrow: 'التطبيق',
    heading: 'حمّل تطبيق Crido واطلب أول تقسيط في 5 دقائق',
    subhead: 'متوفّر على iOS و Android — مجاناً. سجّل، اختر منتجك، وادفعه على راحتك.',
    appStoreEyebrow: 'حمّله من',
    appStoreLabel: 'App Store',
    appStoreAria: 'حمّله من App Store',
    playStoreEyebrow: 'احصل عليه من',
    playStoreLabel: 'Google Play',
    playStoreAria: 'حمّله من Google Play',
    altHome: 'الصفحة الرئيسية لتطبيق Crido',
    altPlan: 'محاكي الأقساط في تطبيق Crido',
    altFinancings: 'صفحة أقساطي في تطبيق Crido',
    morePreviews: 'ولمحات من باقي شاشات التطبيق',
    feat1Title: 'محاكاة فوريّة',
    feat1Text: 'احسب القسط قبل ما تشتري — كل التفاصيل واضحة من البداية.',
    feat2Title: 'متابعة كل الأقساط',
    feat2Text: 'احسب باقي مستحقاتك في كل وقت، وتابع تقدّمك خطوة بخطوة.',
    feat3Title: 'إشعارات تذكيرية',
    feat3Text: 'ما تنسى أي قسط — نذكّرك قبل كل موعد دفع براحة تامة.',
  },
  fr: {
    eyebrow: "L'application",
    heading: "Téléchargez l'app Crido et demandez votre premier paiement échelonné en 5 minutes",
    subhead: 'Disponible sur iOS et Android — gratuitement. Inscrivez-vous, choisissez votre produit, payez à votre rythme.',
    appStoreEyebrow: 'Téléchargez sur',
    appStoreLabel: 'App Store',
    appStoreAria: 'Téléchargez sur App Store',
    playStoreEyebrow: 'Disponible sur',
    playStoreLabel: 'Google Play',
    playStoreAria: 'Téléchargez sur Google Play',
    altHome: "Écran d'accueil de l'app Crido",
    altPlan: "Simulateur de mensualités dans l'app Crido",
    altFinancings: "Page Mes financements dans l'app Crido",
    morePreviews: "Et un aperçu des autres écrans de l'app",
    feat1Title: 'Simulation instantanée',
    feat1Text: "Calculez la mensualité avant d'acheter — tous les détails clairs dès le départ.",
    feat2Title: 'Suivi de toutes vos mensualités',
    feat2Text: 'Calculez le solde restant à tout moment et suivez votre progression.',
    feat3Title: 'Rappels de paiement',
    feat3Text: 'Ne ratez plus jamais une mensualité — on vous prévient avant chaque échéance.',
  },
} as const

/** Apple logo silhouette — single-colour, scales cleanly. */
function AppleGlyph() {
  return (
    <svg viewBox="0 0 384 512" className="h-7 w-7" fill="currentColor" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM262.1 104.5c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  )
}

/** Google Play four-colour triangle. */
function PlayGlyph() {
  return (
    <svg viewBox="0 0 26 24" className="h-7 w-7" aria-hidden="true">
      <polygon points="5,2.6 5,12 11,12" fill="#00C3F7" />
      <polygon points="5,12 5,21.4 11,12" fill="#FF424B" />
      <polygon points="5,2.6 22,12 11,12" fill="#22C55E" />
      <polygon points="5,21.4 22,12 11,12" fill="#FFC72C" />
    </svg>
  )
}

/** Uniform store badge — same width + height as its sibling. */
function StoreBadge({
  href,
  icon,
  eyebrow,
  label,
  ariaLabel,
}: {
  href: string
  icon: ReactNode
  eyebrow: string
  label: string
  ariaLabel: string
}) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className="group inline-flex h-14 min-w-[170px] items-center gap-3 rounded-2xl bg-ink px-5 text-white shadow-[0_18px_36px_-18px_rgba(4,36,30,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#111] active:translate-y-0 sm:h-16 sm:min-w-[180px] sm:px-6"
    >
      <span className="shrink-0 text-white">{icon}</span>
      <span className="flex flex-col leading-none text-start">
        <span className="text-[0.65rem] font-medium text-white/65 sm:text-[0.7rem]">
          {eyebrow}
        </span>
        <span className="latin mt-1 text-[0.95rem] font-bold tracking-tight sm:text-base">
          {label}
        </span>
      </span>
    </a>
  )
}

const SCREEN_LAYOUT = [
  {
    key: 'home',
    src: asset('/images/app-screen-home.webp'),
    altKey: 'altHome' as const,
    wrapperCls:
      'hidden sm:block z-10 sm:-rotate-[6deg] sm:translate-y-8 sm:hover:-translate-y-2 sm:hover:rotate-0',
    floaty: false,
  },
  {
    key: 'plan',
    src: asset('/images/app-screen-plan-selector.webp'),
    altKey: 'altPlan' as const,
    wrapperCls:
      'block z-20 sm:hover:-translate-y-2 sm:hover:rotate-0',
    floaty: true,
  },
  {
    key: 'financings',
    src: asset('/images/app-screen-my-financings.webp'),
    altKey: 'altFinancings' as const,
    wrapperCls:
      'hidden sm:block z-10 sm:rotate-[6deg] sm:translate-y-8 sm:hover:-translate-y-2 sm:hover:rotate-0',
    floaty: false,
  },
] as const

const FEATURES = [
  {
    icon: Sparkles,
    titleKey: 'feat1Title' as const,
    textKey: 'feat1Text' as const,
  },
  {
    icon: LineChart,
    titleKey: 'feat2Title' as const,
    textKey: 'feat2Text' as const,
  },
  {
    icon: Bell,
    titleKey: 'feat3Title' as const,
    textKey: 'feat3Text' as const,
  },
]

function PhoneFrame({
  src,
  alt,
  wrapperCls,
  floaty,
}: {
  src: string
  alt: string
  wrapperCls: string
  floaty?: boolean
}) {
  return (
    <div
      className={`relative transition-transform duration-500 ${wrapperCls}`}
    >
      <div
        className={`relative aspect-[9/19] w-[210px] rounded-[36px] bg-ink p-2 shadow-[0_30px_70px_-25px_rgba(4,36,30,0.55)] ring-1 ring-ink/10 sm:w-[210px] sm:rounded-[40px] sm:p-2.5 sm:shadow-[0_45px_90px_-30px_rgba(4,36,30,0.55)] md:w-[260px] ${
          floaty ? 'floaty' : ''
        }`}
      >
        {/* Notch */}
        <div className="absolute start-1/2 top-2.5 z-30 h-4 w-20 -translate-x-1/2 rounded-full bg-ink sm:top-3 sm:h-5 sm:w-24 rtl:translate-x-1/2" />

        {/* Screen */}
        <div className="relative h-full w-full overflow-hidden rounded-[28px] bg-gradient-to-br from-teal-surface via-cream to-teal-surface/40 sm:rounded-[32px]">
          {/* Fallback decorative content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal text-white shadow-lg">
              <Sparkles size={26} strokeWidth={1.75} />
            </span>
            <div className="space-y-1.5">
              <div className="mx-auto h-2 w-24 rounded-full bg-teal/30" />
              <div className="mx-auto h-2 w-16 rounded-full bg-teal/20" />
            </div>
            <div className="mt-2 w-full space-y-2">
              <div className="h-10 w-full rounded-xl bg-white/80 shadow-sm" />
              <div className="h-10 w-full rounded-xl bg-white/60 shadow-sm" />
              <div className="h-10 w-full rounded-xl bg-white/40 shadow-sm" />
            </div>
          </div>

          {/* Real image overlays the fallback when available */}
          <img
            src={src}
            alt={alt}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      </div>
    </div>
  )
}

/** Compact preview phone shown on mobile under the hero phone. */
function MiniPreview({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-[9/19] w-[78px] overflow-hidden rounded-[18px] bg-ink p-1 shadow-[0_14px_30px_-12px_rgba(4,36,30,0.45)] ring-1 ring-ink/10">
      <div className="absolute start-1/2 top-1.5 z-10 h-1.5 w-8 -translate-x-1/2 rounded-full bg-ink rtl:translate-x-1/2" />
      <div className="relative h-full w-full overflow-hidden rounded-[14px] bg-gradient-to-br from-teal-surface via-cream to-teal-surface/40">
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      </div>
    </div>
  )
}

export function AppShowcase() {
  const t = useT(TR)
  // On mobile we show small previews of the two non-hero phones.
  const mobilePreviews = SCREEN_LAYOUT.filter((s) => s.key !== 'plan')

  return (
    <section
      id="app"
      className="relative overflow-hidden bg-cream py-16 sm:py-20 md:py-28 lg:py-32"
    >
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -top-24 start-1/2 h-[18rem] w-[18rem] -translate-x-1/2 rounded-full bg-teal-surface/60 blur-[100px] sm:-top-32 sm:h-[28rem] sm:w-[28rem] sm:blur-[120px] rtl:translate-x-1/2" />
      {/* Extra ambient blobs to make the section feel alive */}
      <div className="pointer-events-none absolute top-1/3 -start-24 h-[18rem] w-[18rem] rounded-full bg-teal-bright/8 blur-[120px] md:h-[26rem] md:w-[26rem]" />
      <div className="pointer-events-none absolute top-2/3 -end-24 h-[16rem] w-[16rem] rounded-full bg-teal-surface/70 blur-[110px] md:h-[24rem] md:w-[24rem]" />
      <div className="pointer-events-none absolute bottom-10 start-1/3 h-[14rem] w-[14rem] rounded-full bg-amber/6 blur-[120px] md:h-[20rem] md:w-[20rem]" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <Reveal>
          <div className="text-center">
            <p className="text-xs font-semibold tracking-wide text-teal sm:text-sm">
              {t('eyebrow')}
            </p>
            <h2 className="mx-auto mt-2 max-w-3xl text-[1.65rem] font-bold leading-[1.2] text-ink sm:mt-3 sm:text-3xl md:text-[2.6rem] md:leading-tight">
              {t('heading')}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft sm:mt-4 sm:text-base">
              {t('subhead')}
            </p>
          </div>
        </Reveal>

        {/* Store badges — custom uniform design */}
        <Reveal delay={120}>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8">
            <StoreBadge
              href="#download"
              icon={<AppleGlyph />}
              eyebrow={t('appStoreEyebrow')}
              label={t('appStoreLabel')}
              ariaLabel={t('appStoreAria')}
            />
            <StoreBadge
              href="#download"
              icon={<PlayGlyph />}
              eyebrow={t('playStoreEyebrow')}
              label={t('playStoreLabel')}
              ariaLabel={t('playStoreAria')}
            />
          </div>
        </Reveal>

        {/* Phones composition
             Mobile (<sm): single hero phone, side phones hidden
             sm+        : original fanned 3-phone composition */}
        <Reveal delay={180}>
          <div className="mt-12 sm:mt-16">
            <div className="flex items-end justify-center gap-2 sm:gap-6 md:gap-8">
              {SCREEN_LAYOUT.map((s) => (
                <PhoneFrame
                  key={s.key}
                  src={s.src}
                  alt={t(s.altKey)}
                  wrapperCls={s.wrapperCls}
                  floaty={s.floaty}
                />
              ))}
            </div>

            {/* Mobile-only mini previews — hint at the rest of the app */}
            <div className="mt-7 flex flex-col items-center sm:hidden">
              <div className="flex items-center justify-center gap-3">
                {mobilePreviews.map((s) => (
                  <MiniPreview key={s.key} src={s.src} alt={t(s.altKey)} />
                ))}
              </div>
              <p className="mt-3 text-xs text-ink-faint">
                {t('morePreviews')}
              </p>
            </div>
          </div>
        </Reveal>

        {/* Feature cards */}
        <div className="mt-14 grid gap-4 sm:mt-20 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.titleKey} delay={i * 90}>
              <div className="group h-full rounded-2xl border border-line bg-white p-5 transition-colors hover:border-teal/40 sm:rounded-3xl sm:p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-surface text-teal transition-colors group-hover:bg-teal group-hover:text-white sm:h-12 sm:w-12">
                  <f.icon size={22} strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 text-base font-bold text-ink sm:mt-6 sm:text-lg">
                  {t(f.titleKey)}
                </h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft sm:mt-2 sm:text-sm">
                  {t(f.textKey)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
