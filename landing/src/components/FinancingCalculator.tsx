import { asset } from '@/lib/asset'
import { useEffect, useRef, useState, type ComponentType } from 'react'
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  Clock4,
  Hand,
  Laptop,
  Refrigerator,
  Smartphone,
  Sofa,
  Sparkles,
  Tv,
  Wallet,
  WashingMachine,
  type LucideProps,
} from 'lucide-react'
import { useT, useCurrentLocale, fmtMoney, dzdSuffix } from '@/i18n/useT'
import { Reveal } from './Reveal'

type IconKind = ComponentType<LucideProps>

type Product = {
  key: string
  nameKey: 'productIphone' | 'productMacbook' | 'productFridge' | 'productTv' | 'productSofa' | 'productWashing'
  priceDzd: number
  /** fallback icon shown only if the 3D image fails to load */
  icon: IconKind
  /** path to the 3D-rendered product image */
  image: string
}

type Plan = {
  months: number
  labelKey: 'plan4' | 'plan6' | 'plan12'
  marginPct: number
}

const PRODUCTS: Product[] = [
  { key: 'iphone',   nameKey: 'productIphone',   priceDzd: 200_000, icon: Smartphone,     image: asset('/images/category-phones.webp') },
  { key: 'macbook',  nameKey: 'productMacbook',  priceDzd: 350_000, icon: Laptop,         image: asset('/images/category-laptops.webp') },
  { key: 'fridge',   nameKey: 'productFridge',   priceDzd: 120_000, icon: Refrigerator,   image: asset('/images/category-appliances.webp') },
  { key: 'tv',       nameKey: 'productTv',       priceDzd: 90_000,  icon: Tv,             image: asset('/images/category-tvs.webp') },
  { key: 'sofa',     nameKey: 'productSofa',     priceDzd: 80_000,  icon: Sofa,           image: asset('/images/category-furniture.webp') },
  { key: 'washing',  nameKey: 'productWashing',  priceDzd: 60_000,  icon: WashingMachine, image: asset('/images/category-washing.webp') },
]

const PLANS: Plan[] = [
  { months: 4, labelKey: 'plan4', marginPct: 5 },
  { months: 6, labelKey: 'plan6', marginPct: 8 },
  { months: 12, labelKey: 'plan12', marginPct: 15 },
]

type BenefitKey = 'benefit1' | 'benefit2' | 'benefit3' | 'benefit4'

const BENEFITS: { icon: IconKind; key: BenefitKey }[] = [
  { icon: BadgeCheck, key: 'benefit1' },
  { icon: Sparkles, key: 'benefit2' },
  { icon: Clock4, key: 'benefit3' },
  { icon: Wallet, key: 'benefit4' },
]

const TR = {
  ar: {
    eyebrow: 'محاكي التقسيط',
    headingStart: 'احسب قسطك الشهري',
    headingHighlight: 'في ثوانٍ',
    subhead:
      'جرّب التقسيط بنفسك — اختر منتج، اختر المدة، شوف القسط فوراً. كل شيء واضح من البداية.',
    benefit1: 'بدون أي فوائد — السعر النهائي مُسبقاً',
    benefit2: 'هامش مرابحة شفّاف ومحدّد مسبقاً',
    benefit3: 'اختر بين 4، 6، أو 12 شهر',
    benefit4: 'موافقة في أقل من ساعة',
    cta: 'جرّب الآن في التطبيق',
    cardEyebrow: 'محاكاة فوريّة',
    cardTitle: 'اختر منتجك ومدّتك',
    live: 'حيّ',
    handHint: 'احسبها بنفسك — كل شيء يتحدّث فوراً',
    durationLabel: 'مدة التقسيط',
    marginLabel: 'هامش',
    monthlyLabel: 'قسطك الشهري',
    perMonth: 'دج / شهر',
    equalInstallments: 'قسطاً متساوياً',
    total: 'المجموع',
    scheduleLabel: 'جدول الدفع',
    monthlyPayments: 'دفعات شهريّة',
    cashPayment: 'دفعة كاش',
    withCrido: 'مع Crido',
    perMonthShort: '/ شهر',
    spreadPrefix: 'وزّع الضغط على',
    spreadSuffix: 'شهر — بدون أي فوائد.',
    footerNote: 'بدون أي فوائد — مرابحة بهامش ثابت',
    productIphone: 'iPhone 16',
    productMacbook: 'MacBook Air',
    productFridge: 'ثلاجة',
    productTv: 'تلفاز ذكي',
    productSofa: 'أريكة',
    productWashing: 'غسّالة',
    plan4: '4 أشهر',
    plan6: '6 أشهر',
    plan12: '12 شهر',
  },
  fr: {
    eyebrow: 'Simulateur',
    headingStart: 'Calculez votre mensualité',
    headingHighlight: 'en quelques secondes',
    subhead:
      'Essayez le paiement échelonné vous-même — choisissez un produit, choisissez la durée, et voyez la mensualité instantanément. Tout est clair dès le départ.',
    benefit1: "Zéro intérêt — prix final connu à l'avance",
    benefit2: 'Marge Murabaha transparente et fixe',
    benefit3: 'Choisissez entre 4, 6 ou 12 mois',
    benefit4: "Approbation en moins d'une heure",
    cta: "Essayez dans l'app",
    cardEyebrow: 'Simulation instantanée',
    cardTitle: 'Choisissez produit et durée',
    live: 'Live',
    handHint: 'Calculez vous-même — tout se met à jour instantanément',
    durationLabel: 'Durée du paiement',
    marginLabel: 'Marge',
    monthlyLabel: 'Votre mensualité',
    perMonth: 'DZD / mois',
    equalInstallments: 'mensualités égales',
    total: 'Total',
    scheduleLabel: 'Calendrier de paiement',
    monthlyPayments: 'paiements mensuels',
    cashPayment: 'Paiement comptant',
    withCrido: 'Avec Crido',
    perMonthShort: '/ mois',
    spreadPrefix: 'Étalez le coût sur',
    spreadSuffix: 'mois — aucun intérêt.',
    footerNote: 'Aucun intérêt — Murabaha avec marge fixe',
    productIphone: 'iPhone 16',
    productMacbook: 'MacBook Air',
    productFridge: 'Réfrigérateur',
    productTv: 'Smart TV',
    productSofa: 'Canapé',
    productWashing: 'Machine à laver',
    plan4: '4 mois',
    plan6: '6 mois',
    plan12: '12 mois',
  },
} as const

/**
 * Counts up (or down) to `target` over `durationMs` using an ease-out curve.
 * Returns the current animating value (already rounded to an integer).
 */
function useAnimatedNumber(target: number, durationMs = 480) {
  const [current, setCurrent] = useState(target)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const start = current
    if (start === target) return

    const startTime = performance.now()
    const step = (now: number) => {
      const elapsed = now - startTime
      const t = Math.min(elapsed / durationMs, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3)
      setCurrent(Math.round(start + (target - start) * eased))
      if (t < 1) rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
    // we deliberately omit `current` from deps so the animation always starts
    // from the *last* rendered value rather than retriggering on every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs])

  return current
}

export function FinancingCalculator() {
  const t = useT(TR)
  const locale = useCurrentLocale()

  const [productKey, setProductKey] = useState<string>(PRODUCTS[0].key)
  const [months, setMonths] = useState<number>(12)

  const product = PRODUCTS.find((p) => p.key === productKey) ?? PRODUCTS[0]
  const plan = PLANS.find((p) => p.months === months) ?? PLANS[2]

  const total = product.priceDzd * (1 + plan.marginPct / 100)
  const monthly = total / plan.months

  const animatedMonthly = useAnimatedNumber(Math.round(monthly), 480)
  const animatedTotal = useAnimatedNumber(Math.round(total), 480)

  // Force the schedule-dots cascade to replay whenever the plan or product changes.
  const scheduleKey = `${product.key}-${plan.months}`

  return (
    <section
      id="calculator"
      aria-labelledby="calculator-heading"
      className="relative overflow-hidden bg-cream-deep py-16 sm:py-20 md:py-24 lg:py-32"
    >
      {/* ── Ambient mesh-gradient blobs ─────────────────────── */}
      <div className="pointer-events-none absolute -top-32 -start-24 h-[20rem] w-[20rem] rounded-full bg-teal-surface/70 blur-[110px] sm:h-[30rem] sm:w-[30rem] sm:blur-[140px]" />
      <div className="glow-pulse pointer-events-none absolute -bottom-40 -end-24 h-[18rem] w-[18rem] rounded-full bg-teal-bright/15 blur-[110px] sm:h-[28rem] sm:w-[28rem] sm:blur-[130px]" />
      <div className="drift pointer-events-none absolute top-1/3 start-1/2 h-[14rem] w-[14rem] -translate-x-1/2 rounded-full bg-amber/10 blur-[100px] sm:h-[22rem] sm:w-[22rem]" />

      {/* ── Two-layer pattern: fine dots + tessellation ────── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(4,36,30,0.08) 1px, transparent 0)',
          backgroundSize: '34px 34px',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><path d='M40 4 L74 22 L74 58 L40 76 L6 58 L6 22 Z' fill='none' stroke='%2304241E' stroke-width='1'/><path d='M40 24 L58 34 L58 50 L40 60 L22 50 L22 34 Z' fill='none' stroke='%2304241E' stroke-width='0.6'/></svg>\")",
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid items-center gap-10 sm:gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
          {/* ─────────────────────────────────────────────────
             LEFT — copy + benefits
             ───────────────────────────────────────────────── */}
          <div>
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal sm:text-sm">
                {t('eyebrow')}
              </p>
              <h2
                id="calculator-heading"
                className="mt-3 max-w-2xl text-[1.7rem] font-bold leading-[1.18] text-ink sm:mt-4 sm:text-3xl md:text-[2.6rem] md:leading-tight"
              >
                {t('headingStart')}{' '}
                <span className="relative inline-block whitespace-nowrap text-teal">
                  {t('headingHighlight')}
                  {/* underline accent */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-1 start-0 h-[3px] w-full rounded-full bg-gradient-to-l from-teal-bright via-teal to-teal/40"
                  />
                  {/* tiny sparkle */}
                  <Sparkles
                    aria-hidden
                    size={16}
                    strokeWidth={2.4}
                    className="glow-pulse absolute -top-1 -end-4 text-amber sm:-top-1.5 sm:-end-5"
                  />
                </span>
                .
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft sm:mt-4 md:text-base lg:text-lg">
                {t('subhead')}
              </p>
            </Reveal>

            <Reveal delay={120}>
              <ul className="mt-7 grid gap-3 sm:mt-9 sm:gap-3.5">
                {BENEFITS.map(({ icon: Icon, key }) => (
                  <li
                    key={key}
                    className="flex items-start gap-3 text-[14.5px] leading-relaxed text-ink-soft sm:text-[15px]"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-surface text-teal">
                      <Icon size={15} strokeWidth={2.2} />
                    </span>
                    <span className="pt-0.5">{t(key)}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={220}>
              <a
                href="#download"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_36px_-18px_rgba(4,36,30,0.55)] transition-transform hover:scale-[1.03] active:scale-[0.99] sm:mt-10"
              >
                {t('cta')}
                <ArrowLeft size={17} className="rtl:rotate-180" />
              </a>
            </Reveal>
          </div>

          {/* ─────────────────────────────────────────────────
             RIGHT — interactive calculator card
             ───────────────────────────────────────────────── */}
          <Reveal delay={160}>
            <div className="relative">
              {/* Stacked decorative shadow layers (offset rectangles) */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 translate-x-3 translate-y-3 rounded-[28px] bg-teal/15 sm:translate-x-4 sm:translate-y-4 sm:rounded-[32px] rtl:-translate-x-3 sm:rtl:-translate-x-4"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 translate-x-6 translate-y-6 rounded-[28px] bg-teal-bright/10 sm:translate-x-8 sm:translate-y-8 sm:rounded-[32px] rtl:-translate-x-6 sm:rtl:-translate-x-8"
              />

              {/* Gradient border wrapper (thin) */}
              <div className="floaty relative rounded-[28px] bg-gradient-to-br from-teal/15 via-line/40 to-teal-bright/15 p-[1.5px] shadow-[0_40px_90px_-40px_rgba(4,36,30,0.5),0_18px_40px_-18px_rgba(4,36,30,0.25)] sm:rounded-[32px]">
                <div className="relative overflow-hidden rounded-[26.5px] bg-white p-5 sm:rounded-[30.5px] sm:p-7">
                  {/* Card header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal">
                        {t('cardEyebrow')}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-ink sm:text-base">
                        {t('cardTitle')}
                      </p>
                    </div>
                    <span className="hidden h-9 items-center gap-1.5 rounded-full bg-teal-surface px-3 text-[12px] font-semibold text-teal sm:inline-flex">
                      <span className="glow-pulse h-1.5 w-1.5 rounded-full bg-teal-bright shadow-[0_0_0_3px_rgba(29,158,117,0.18)]" />
                      {t('live')}
                    </span>
                  </div>

                  {/* Playful hint */}
                  <p className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-ink-faint sm:text-[12px]">
                    <Hand size={12} strokeWidth={2} className="text-amber" />
                    {t('handHint')}
                  </p>

                  {/* ── Product selector — 2 cols on mobile, 3 cols on desktop ── */}
                  <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-6 sm:grid-cols-3 sm:gap-2.5">
                    {PRODUCTS.map((p) => {
                      const Icon = p.icon
                      const active = p.key === product.key
                      const productName = t(p.nameKey)
                      return (
                        <button
                          type="button"
                          key={p.key}
                          onClick={() => setProductKey(p.key)}
                          aria-pressed={active}
                          className={`group relative flex flex-col items-stretch gap-2 overflow-hidden rounded-2xl border px-2 py-2.5 text-start transition-all duration-300 sm:gap-2.5 sm:px-2.5 sm:py-3 ${
                            active
                              ? 'border-teal/45 bg-gradient-to-br from-teal-surface/70 via-white to-teal-surface/40 shadow-[inset_0_0_0_1.5px_var(--color-teal),0_14px_28px_-18px_rgba(15,110,86,0.5)]'
                              : 'border-line bg-cream hover:-translate-y-0.5 hover:border-teal/30 hover:bg-white hover:shadow-[0_14px_28px_-22px_rgba(4,36,30,0.35)]'
                          }`}
                        >
                          {/* 3D product image holder */}
                          <span className="relative mx-auto block aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br from-teal-surface/60 via-cream to-teal-surface/30 sm:rounded-2xl">
                            {/* soft halo behind product */}
                            <span className="pointer-events-none absolute inset-0 m-auto h-3/4 w-3/4 rounded-full bg-teal-bright/15 blur-2xl" />
                            {/* fallback icon (rendered underneath; image will cover) */}
                            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-teal/60">
                              <Icon size={26} strokeWidth={1.5} />
                            </span>
                            <img
                              src={p.image}
                              alt={productName}
                              loading="lazy"
                              className={`relative h-full w-full object-contain p-2 transition-transform duration-500 ease-out sm:p-2.5 ${
                                active ? 'scale-[1.06]' : 'group-hover:scale-[1.08]'
                              }`}
                              onError={(e) => {
                                ;(e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          </span>

                          {/* Name + price */}
                          <span className="block text-center">
                            <span className="block truncate text-[12px] font-semibold leading-tight text-ink sm:text-[13px]">
                              {productName}
                            </span>
                            <span className="latin mt-0.5 block text-[11px] text-ink-faint sm:text-[11.5px]">
                              {fmtMoney(p.priceDzd, locale)} {dzdSuffix(locale)}
                            </span>
                          </span>

                          {active ? (
                            <span className="absolute end-2 top-2 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-teal text-white shadow-[0_4px_10px_-2px_rgba(15,110,86,0.55)]">
                              <Check size={10} strokeWidth={3.2} />
                            </span>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>

                  {/* ── Duration pills ── */}
                  <div className="mt-5 sm:mt-6">
                    <div className="mb-2.5 flex items-center justify-between">
                      <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-faint sm:text-xs">
                        {t('durationLabel')}
                      </span>
                      <span className="text-[11.5px] text-ink-faint">
                        {t('marginLabel')}{' '}
                        <span className="latin font-semibold text-ink-soft">
                          {plan.marginPct}%
                        </span>
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                      {PLANS.map((p) => {
                        const active = p.months === plan.months
                        return (
                          <button
                            type="button"
                            key={p.months}
                            onClick={() => setMonths(p.months)}
                            aria-pressed={active}
                            className={`h-12 rounded-2xl text-sm font-semibold transition-all duration-200 sm:h-[3.25rem] sm:text-[15px] ${
                              active
                                ? 'bg-teal text-white shadow-[0_14px_28px_-14px_rgba(15,110,86,0.6)]'
                                : 'border border-line bg-cream text-ink-soft hover:-translate-y-0.5 hover:border-teal/30 hover:text-ink'
                            }`}
                          >
                            {t(p.labelKey)}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* ── Featured monthly installment card ── */}
                  <div className="mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-teal-deep via-teal-deep to-teal-night p-5 text-white shadow-[0_22px_45px_-22px_rgba(4,36,30,0.6)] sm:mt-6 sm:rounded-3xl sm:p-6">
                    {/* radial accents */}
                    <div className="pointer-events-none absolute inset-0 -z-10 mx-auto h-32 w-32 rounded-full bg-teal-bright/30 blur-3xl" />

                    <div className="relative flex items-baseline justify-between gap-3">
                      <span className="text-[12px] font-medium uppercase tracking-[0.16em] text-teal-surface/80 sm:text-[13px]">
                        {t('monthlyLabel')}
                      </span>
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-teal-surface ring-1 ring-white/15">
                        {t(plan.labelKey)}
                      </span>
                    </div>

                    <div className="relative mt-2 flex items-baseline gap-2">
                      <span className="latin text-[2.6rem] font-bold leading-none tracking-tight tabular-nums sm:text-[3.2rem]">
                        {fmtMoney(animatedMonthly, locale)}
                      </span>
                      <span className="text-sm font-medium text-teal-surface/80 sm:text-base">
                        {t('perMonth')}
                      </span>
                    </div>

                    <div className="relative mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-white/10 pt-3 text-[12.5px] text-teal-surface/80 sm:text-[13px]">
                      <span>
                        <span className="latin font-semibold text-white">{plan.months}</span>{' '}
                        {t('equalInstallments')}
                      </span>
                      <span className="text-teal-surface/40">·</span>
                      <span>
                        {t('total')}{' '}
                        <span className="latin font-semibold text-white">
                          {fmtMoney(animatedTotal, locale)}
                        </span>{' '}
                        {dzdSuffix(locale)}
                      </span>
                    </div>
                  </div>

                  {/* ── Installment schedule (dots) ── */}
                  <div className="mt-5 sm:mt-6">
                    <div className="mb-2.5 flex items-baseline justify-between gap-2">
                      <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-faint sm:text-xs">
                        {t('scheduleLabel')}
                      </span>
                      <span className="text-[11.5px] text-ink-faint">
                        <span className="latin font-semibold text-ink-soft">{plan.months}</span>{' '}
                        {t('monthlyPayments')}
                      </span>
                    </div>

                    <div
                      key={scheduleKey}
                      className={`grid gap-x-1.5 gap-y-2 ${
                        plan.months === 4
                          ? 'grid-cols-4'
                          : plan.months === 6
                          ? 'grid-cols-6'
                          : 'grid-cols-6 sm:grid-cols-12'
                      }`}
                    >
                      {Array.from({ length: plan.months }).map((_, i) => {
                        const isNext = i === 0
                        return (
                          <div
                            key={i}
                            className="fade-up flex flex-col items-center gap-1.5"
                            style={{ animationDelay: `${i * 55}ms` }}
                          >
                            <span
                              className={`relative flex h-2.5 w-2.5 items-center justify-center rounded-full sm:h-3 sm:w-3 ${
                                isNext
                                  ? 'bg-amber shadow-[0_0_0_4px_rgba(239,159,39,0.18)]'
                                  : 'bg-teal-bright/35'
                              }`}
                            >
                              {isNext ? (
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber/60 opacity-60" />
                              ) : null}
                            </span>
                            <span
                              className={`latin text-[9.5px] leading-none sm:text-[10.5px] ${
                                isNext ? 'font-semibold text-amber' : 'text-ink-faint'
                              }`}
                            >
                              {i + 1}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* ── Savings comparison callout ── */}
                  <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-gradient-to-l from-teal-surface/40 via-cream to-amber/10 p-3.5 sm:mt-6 sm:p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-amber shadow-[0_6px_14px_-6px_rgba(239,159,39,0.6)]">
                        <Sparkles size={15} strokeWidth={2.2} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[12.5px] text-ink-soft sm:text-[13px]">{t('cashPayment')}</span>
                          <span className="latin text-[12.5px] font-medium text-ink-faint line-through decoration-ink-faint/50 sm:text-[13px]">
                            {fmtMoney(product.priceDzd, locale)} {dzdSuffix(locale)}
                          </span>
                        </div>

                        <div className="mt-0.5 flex items-baseline gap-2">
                          <span className="text-[12.5px] font-semibold text-teal sm:text-[13px]">
                            {t('withCrido')}
                          </span>
                          <span className="latin text-[14px] font-bold text-teal sm:text-[15px] tabular-nums">
                            {fmtMoney(animatedMonthly, locale)} {dzdSuffix(locale)}
                          </span>
                          <span className="text-[11.5px] text-ink-faint">{t('perMonthShort')}</span>
                        </div>

                        <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-soft sm:text-[12.5px]">
                          {t('spreadPrefix')}{' '}
                          <span className="latin font-semibold text-ink">
                            {plan.months}
                          </span>{' '}
                          {t('spreadSuffix')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer note */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-[12.5px] text-ink-faint sm:mt-5 sm:text-[13px]">
                    <Check size={14} className="text-teal" strokeWidth={2.4} />
                    {t('footerNote')}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
