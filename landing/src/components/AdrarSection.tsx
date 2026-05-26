import { ArrowLeft, Check, MapPin, Sparkles } from 'lucide-react'
import { useT } from '@/i18n/useT'
import { Reveal } from './Reveal'

const TR = {
  ar: {
    eyebrow: 'موقعنا',
    heading: 'نبدأ من أدرار. ونحلم بكل الجزائر.',
    subhead:
      'Crido متوفّرة حالياً في ولاية أدرار. نشتغل على التوسّع لكامل الولايات في 2027 — خطوة بخطوة، ولاية بولاية.',
    badgeWilaya: 'أدرار',
    badgeDesert: 'من قلب الصحراء',
    badgeDesertCaption: 'نبني Crido قريبة من الناس، تفهم اللهجة والعادات.',
    statPopulation: 'ساكن في أدرار',
    statCommunes: 'بلدية',
    statMerchants: 'متجر شريك مستهدف',
    statYear: 'سنة الانطلاق',
    roadmapEyebrow: 'خارطة التوسّع',
    roadmapHeading: 'من أدرار، نحو كامل الجزائر',
    wilayaAdrar: 'أدرار',
    wilayaTimimoun: 'تيميمون',
    wilayaBechar: 'بشار',
    wilayaOther: 'ولايات أخرى',
    captionNow: 'متوفّرة الآن',
    captionSoon: 'قريباً',
    caption2026: '2026',
    captionUpcoming: '2027',
    ctaLead: 'هل أنت في ولاية أخرى؟',
    ctaTail: 'قول لنا، ونعلمك أوّل ما نوصل لك.',
    ctaButton: 'اكتب لنا',
    imageAlt: 'رسم لولاية أدرار مع نخلة وغروب الشمس',
  },
  fr: {
    eyebrow: 'Notre territoire',
    heading: "On commence par Adrar. Et on rêve de toute l'Algérie.",
    subhead:
      "Crido est actuellement disponible dans la Wilaya d'Adrar. Nous travaillons pour nous étendre à toutes les Wilayas en 2027 — étape par étape, Wilaya par Wilaya.",
    badgeWilaya: 'Adrar',
    badgeDesert: 'Au cœur du Sahara',
    badgeDesertCaption: 'On construit Crido proche des gens, qui comprend le dialecte et les coutumes.',
    statPopulation: 'habitants à Adrar',
    statCommunes: 'communes',
    statMerchants: 'marchands partenaires visés',
    statYear: 'année de lancement',
    roadmapEyebrow: "Feuille de route d'expansion",
    roadmapHeading: "D'Adrar, vers toute l'Algérie",
    wilayaAdrar: 'Adrar',
    wilayaTimimoun: 'Timimoun',
    wilayaBechar: 'Béchar',
    wilayaOther: 'Autres Wilayas',
    captionNow: 'Maintenant',
    captionSoon: 'Bientôt',
    caption2026: '2026',
    captionUpcoming: 'À venir',
    ctaLead: 'Vous êtes dans une autre Wilaya ?',
    ctaTail: "Dites-le-nous, et on vous prévient dès qu'on arrive chez vous.",
    ctaButton: 'Écrivez-nous',
    imageAlt: "Illustration de la Wilaya d'Adrar avec un palmier et un coucher de soleil",
  },
} as const

type TRKey = keyof typeof TR.ar

type Stat = { key: string; value: string; labelKey: TRKey }

const STATS: Stat[] = [
  { key: 'pop', value: '440k', labelKey: 'statPopulation' },
  { key: 'communes', value: '28', labelKey: 'statCommunes' },
  { key: 'merchants', value: '+50', labelKey: 'statMerchants' },
  { key: 'year', value: '2026', labelKey: 'statYear' },
]

type Step = {
  key: string
  nameKey: TRKey
  captionKey: TRKey
  status: 'live' | 'next' | 'soon'
}

const ROADMAP: Step[] = [
  { key: 'adrar', nameKey: 'wilayaAdrar', captionKey: 'captionNow', status: 'live' },
  { key: 'timimoun', nameKey: 'wilayaTimimoun', captionKey: 'captionSoon', status: 'next' },
  { key: 'bechar', nameKey: 'wilayaBechar', captionKey: 'caption2026', status: 'soon' },
  { key: 'other', nameKey: 'wilayaOther', captionKey: 'captionUpcoming', status: 'soon' },
]

function RoadmapPill({
  step,
  index,
  name,
  caption,
}: {
  step: Step
  index: number
  name: string
  caption: string
}) {
  const isLive = step.status === 'live'
  const isNext = step.status === 'next'

  return (
    <Reveal delay={index * 90}>
      <div className="relative flex w-full flex-col items-center gap-2 text-center">
        {/* Dot marker on top */}
        <span
          className={[
            'flex h-7 w-7 items-center justify-center rounded-full ring-4 transition-colors',
            isLive
              ? 'bg-teal text-white ring-teal/15'
              : isNext
                ? 'bg-white text-teal ring-teal/15'
                : 'bg-white text-ink-faint ring-line',
          ].join(' ')}
        >
          {isLive ? (
            <Check size={14} strokeWidth={2.6} />
          ) : (
            <span className="latin text-[0.68rem] font-bold">
              {String(index + 1).padStart(2, '0')}
            </span>
          )}
        </span>

        {/* Pill */}
        <div
          className={[
            'inline-flex min-w-[6.5rem] flex-col items-center rounded-2xl border px-3 py-2 transition-colors sm:px-4 sm:py-2.5',
            isLive
              ? 'border-teal/30 bg-teal text-white shadow-[0_18px_40px_-20px_rgba(15,110,86,0.6)]'
              : isNext
                ? 'border-teal/25 bg-white text-teal'
                : 'border-teal/15 bg-white/60 text-ink-soft',
          ].join(' ')}
        >
          <span className="text-sm font-bold sm:text-[0.95rem]">{name}</span>
          <span
            className={[
              'mt-0.5 text-[0.65rem] leading-tight sm:text-[0.7rem]',
              isLive ? 'text-teal-surface/90' : 'text-ink-faint',
            ].join(' ')}
          >
            {caption}
          </span>
        </div>
      </div>
    </Reveal>
  )
}

export function AdrarSection() {
  const t = useT(TR)

  return (
    <section
      id="adrar"
      className="relative overflow-hidden bg-teal-surface py-16 sm:py-20 md:py-24 lg:py-32"
    >
      {/* Decorative blobs */}
      <div className="glow-pulse pointer-events-none absolute -top-32 -start-32 h-[28rem] w-[28rem] rounded-full bg-teal-bright/25 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -end-24 h-[26rem] w-[26rem] rounded-full bg-teal/15 blur-[130px]" />
      {/* Extra ambient blobs — amber (desert) + soft teal */}
      <div className="pointer-events-none absolute top-1/3 end-1/4 h-[18rem] w-[18rem] rounded-full bg-amber/10 blur-[130px] md:h-[24rem] md:w-[24rem]" />
      <div className="pointer-events-none absolute bottom-1/4 start-1/3 h-[14rem] w-[14rem] rounded-full bg-teal-bright/15 blur-[110px] md:h-[20rem] md:w-[20rem]" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        {/* Eyebrow + heading */}
        <Reveal>
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal/15 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal backdrop-blur sm:text-sm">
              <MapPin size={14} strokeWidth={2.4} />
              {t('eyebrow')}
            </span>
            <h2 className="mt-4 text-2xl font-bold leading-tight text-teal-deep sm:text-3xl md:text-[2.6rem] lg:text-[3rem]">
              {t('heading')}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft sm:mt-5 md:text-base lg:text-lg">
              {t('subhead')}
            </p>
          </div>
        </Reveal>

        {/* Visual showcase */}
        <Reveal delay={140}>
          <div className="relative mx-auto mt-12 max-w-4xl sm:mt-14 md:mt-16">
            {/* Outer glow */}
            <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[2.25rem] bg-gradient-to-br from-teal-bright/25 via-teal-surface/0 to-amber/15 blur-2xl" />

            <div className="relative overflow-hidden rounded-3xl border border-teal/10 bg-white shadow-[0_30px_60px_-30px_rgba(4,36,30,0.25)]">
              <img
                src="/images/adrar-context.png"
                alt={t('imageAlt')}
                className="block h-auto w-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />

              {/* Soft gradient at the bottom for depth */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white/85 via-white/20 to-transparent" />

              {/* Floating badge on top */}
              <div className="floaty absolute top-4 end-4 inline-flex items-center gap-1.5 rounded-full border border-teal/15 bg-white/90 px-3 py-1.5 text-xs font-semibold text-teal shadow-sm backdrop-blur sm:top-6 sm:end-6 sm:text-sm">
                <Sparkles size={13} strokeWidth={2.2} className="text-amber" />
                <span className="latin tracking-tight">Wilaya 01</span>
                <span>·</span>
                <span>{t('badgeWilaya')}</span>
              </div>

              {/* Bottom-left caption chip */}
              <div className="absolute bottom-4 start-4 max-w-[14rem] rounded-2xl border border-teal/10 bg-white/90 p-3 text-start shadow-sm backdrop-blur sm:bottom-6 sm:start-6 sm:max-w-xs sm:p-4">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-teal sm:text-xs">
                  {t('badgeDesert')}
                </p>
                <p className="mt-1 text-xs leading-snug text-ink-soft sm:text-sm">
                  {t('badgeDesertCaption')}
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Stats row */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-4 md:grid-cols-4 md:gap-5">
          {STATS.map((s, i) => (
            <Reveal key={s.key} delay={i * 90}>
              <div className="group flex h-full flex-col items-center rounded-3xl border border-teal/10 bg-white px-4 py-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-teal/30 hover:shadow-[0_24px_50px_-30px_rgba(4,36,30,0.3)] sm:px-5 sm:py-6">
                <p className="latin text-3xl font-bold text-teal md:text-4xl">
                  {s.value}
                </p>
                <p className="mt-2 text-xs leading-snug text-ink-soft md:text-sm">
                  {t(s.labelKey)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Roadmap timeline */}
        <Reveal delay={120}>
          <div className="mt-14 sm:mt-16 md:mt-20">
            <div className="flex flex-col items-center text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-teal sm:text-sm">
                {t('roadmapEyebrow')}
              </span>
              <h3 className="mt-2 text-xl font-bold text-teal-deep sm:text-2xl md:text-[1.75rem]">
                {t('roadmapHeading')}
              </h3>
            </div>

            {/* Timeline */}
            <div className="relative mt-10 sm:mt-12">
              {/* Desktop connector (horizontal dotted line) */}
              <div
                aria-hidden
                className="pointer-events-none absolute start-[8%] end-[8%] top-[14px] hidden border-t-2 border-dashed border-teal/25 md:block"
              />

              {/* Mobile connector (vertical line) */}
              <div
                aria-hidden
                className="pointer-events-none absolute start-1/2 top-0 bottom-0 hidden w-px -translate-x-1/2 bg-gradient-to-b from-teal/10 via-teal/25 to-teal/0 md:hidden"
              />

              <div className="relative grid gap-6 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
                {ROADMAP.map((step, i) => (
                  <RoadmapPill
                    key={step.key}
                    step={step}
                    index={i}
                    name={t(step.nameKey)}
                    caption={t(step.captionKey)}
                  />
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Bottom CTA */}
        <Reveal delay={160}>
          <div className="mt-12 flex flex-col items-center justify-center gap-3 rounded-3xl border border-teal/15 bg-white/70 px-5 py-5 text-center backdrop-blur sm:mt-14 sm:flex-row sm:gap-5 sm:px-6 sm:text-start md:mt-16">
            <p className="text-sm text-ink-soft md:text-base">
              <span className="font-semibold text-ink">{t('ctaLead')}</span>{' '}
              {t('ctaTail')}
            </p>
            <a
              href="#contact"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] sm:px-6"
            >
              {t('ctaButton')}
              <ArrowLeft size={16} strokeWidth={2.2} />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
