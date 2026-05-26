import { Check, Sparkles } from 'lucide-react'
import { Reveal } from './Reveal'
import { useT, useCurrentLocale, fmtMoney, dzdSuffix } from '@/i18n/useT'

const TR = {
  ar: {
    eyebrow: 'الخطط',
    heading: 'اختر المدة التي تناسبك.',
    exampleBefore: 'مثال توضيحي على مشترى بقيمة ',
    perMonth: '/ شهر',
    totalPrefix: 'المجموع',
    popular: 'الأكثر شعبية',
    mostChosen: 'الأكثر اختياراً',
    noInterest: 'بدون أي فوائد',
    plan4Months: '4 أشهر',
    plan6Months: '6 أشهر',
    plan12Months: '12 شهراً',
    margin5: 'هامش 5%',
    margin8: 'هامش 8%',
    margin15: 'هامش 15%',
    note4: 'للمشتريات الصغيرة والمتوسطة.',
    note6: 'توازن مريح بين القسط والمدة.',
    note12: 'الأنسب للمشتريات الكبيرة.',
  },
  fr: {
    eyebrow: 'Plans',
    heading: 'Choisissez la durée qui vous convient.',
    exampleBefore: 'Exemple illustratif pour un achat de ',
    perMonth: '/ mois',
    totalPrefix: 'Total',
    popular: 'Le plus populaire',
    mostChosen: 'Le plus choisi',
    noInterest: 'Zéro intérêt',
    plan4Months: '4 mois',
    plan6Months: '6 mois',
    plan12Months: '12 mois',
    margin5: 'Marge 5%',
    margin8: 'Marge 8%',
    margin15: 'Marge 15%',
    note4: 'Pour les petits et moyens achats.',
    note6: 'Un équilibre confortable entre mensualité et durée.',
    note12: 'Idéal pour les achats importants.',
  },
} as const

type PlanKey = 'plan4Months' | 'plan6Months' | 'plan12Months'
type MarginKey = 'margin5' | 'margin8' | 'margin15'
type NoteKey = 'note4' | 'note6' | 'note12'

type Plan = {
  monthsKey: PlanKey
  monthly: number
  total: number
  marginKey: MarginKey
  noteKey: NoteKey
  featured?: boolean
  popular?: boolean
}

const EXAMPLE_PRINCIPAL = 200000

const PLANS: Plan[] = [
  {
    monthsKey: 'plan4Months',
    monthly: 52500,
    total: 210000,
    marginKey: 'margin5',
    noteKey: 'note4',
  },
  {
    monthsKey: 'plan6Months',
    monthly: 36000,
    total: 216000,
    marginKey: 'margin8',
    noteKey: 'note6',
    popular: true,
  },
  {
    monthsKey: 'plan12Months',
    monthly: 19167,
    total: 230000,
    marginKey: 'margin15',
    noteKey: 'note12',
    featured: true,
  },
]

export function Plans() {
  const t = useT(TR)
  const locale = useCurrentLocale()
  const suffix = dzdSuffix(locale)

  return (
    <section id="plans" className="relative overflow-hidden bg-white py-16 sm:py-20 md:py-24 lg:py-32">
      {/* Soft top-corner accent */}
      <div className="pointer-events-none absolute -top-32 -start-24 h-80 w-80 rounded-full bg-teal-surface/40 blur-[110px] sm:h-[26rem] sm:w-[26rem]" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <Reveal>
          <p className="text-xs font-semibold text-teal sm:text-sm">{t('eyebrow')}</p>
          <h2 className="mt-2 max-w-2xl text-2xl font-bold leading-tight tracking-tight text-ink sm:mt-3 sm:text-3xl md:text-[2.6rem]">
            {t('heading')}
          </h2>
          <p className="mt-3 text-sm text-ink-soft sm:mt-4 md:text-base lg:text-lg">
            {t('exampleBefore')}
            <span className="latin font-semibold text-ink">
              {fmtMoney(EXAMPLE_PRINCIPAL, locale)} {suffix}
            </span>
            .
          </p>
        </Reveal>

        <div className="mt-8 grid items-stretch gap-4 sm:mt-10 sm:gap-5 md:mt-14 md:grid-cols-3">
          {PLANS.map((p, i) => {
            const isFeatured = !!p.featured
            const isPopular = !!p.popular
            return (
              <Reveal key={p.monthsKey} delay={i * 110}>
                <div
                  className={`card-tilt relative flex h-full flex-col rounded-3xl p-5 md:p-7 lg:p-8 ${
                    isFeatured
                      ? 'bg-teal-deep text-white shadow-[0_30px_60px_-30px_rgba(4,36,30,0.6)] ring-1 ring-teal-bright/40'
                      : isPopular
                        ? 'border border-teal/30 bg-white text-ink shadow-[0_22px_46px_-30px_rgba(4,36,30,0.4)] ring-1 ring-teal/15 md:-translate-y-2'
                        : 'border border-line bg-cream text-ink hover:border-teal/30'
                  }`}
                >
                  {/* "Most popular" ribbon on the middle plan */}
                  {isPopular ? (
                    <span className="absolute -top-3 start-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-teal px-3 py-1 text-[11px] font-semibold text-white shadow-[0_6px_18px_-6px_rgba(4,36,30,0.6)] sm:text-xs rtl:translate-x-1/2">
                      <Sparkles size={11} strokeWidth={2.5} />
                      {t('popular')}
                    </span>
                  ) : null}

                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold tracking-tight sm:text-lg">{t(p.monthsKey)}</span>
                    {isFeatured ? (
                      <span className="rounded-full bg-amber px-3 py-1 text-xs font-semibold text-teal-deep">
                        {t('mostChosen')}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-baseline gap-1.5 sm:mt-6">
                    <span className="latin text-3xl font-bold tracking-tight sm:text-4xl">
                      {fmtMoney(p.monthly, locale)}
                    </span>
                    <span className={`text-sm sm:text-base ${isFeatured ? 'text-teal-surface/70' : 'text-ink-faint'}`}>
                      {suffix} {t('perMonth')}
                    </span>
                  </div>

                  <p className={`mt-2 text-sm ${isFeatured ? 'text-teal-surface/70' : 'text-ink-soft'}`}>
                    {t(p.marginKey)} · {t('totalPrefix')}{' '}
                    <span className="latin">{fmtMoney(p.total, locale)}</span> {suffix}
                  </p>

                  <div
                    className={`my-5 border-t sm:my-6 ${
                      isFeatured ? 'border-white/15' : isPopular ? 'border-teal/15' : 'border-line'
                    }`}
                  />

                  <p
                    className={`text-sm leading-relaxed ${
                      isFeatured ? 'text-teal-surface/80' : 'text-ink-soft'
                    }`}
                  >
                    {t(p.noteKey)}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-sm font-medium sm:mt-6">
                    <Check
                      size={16}
                      className={
                        isFeatured ? 'text-teal-bright' : isPopular ? 'text-teal' : 'text-teal'
                      }
                    />
                    {t('noInterest')}
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
