import { asset } from '@/lib/asset'
import { ArrowLeft, TrendingUp, ShieldCheck, Headset } from 'lucide-react'
import { useT } from '@/i18n/useT'
import { Reveal } from './Reveal'

const TR = {
  ar: {
    eyebrow: 'للتجار',
    heading: 'زِد مبيعاتك. نحن نتكفّل بالباقي.',
    subhead:
      'Crido تدفع لك بالكامل عند البيع، تتكفّل بتحصيل الأقساط من العميل، وتعطيك زبائن جدد ما يقدروش يشروا نقداً.',
    statSalesLabel: 'زيادة في حجم البيع',
    statDelayLabel: 'تأخّر في الدفع لك',
    statDelayValue: '0 يوم',
    statSupportLabel: 'دعم وتتبّع المبيعات',
    proofUpfront: 'تستلم ثمن البيع كاملاً ومقدّماً منّا',
    proofCollection: 'نتكفّل بمخاطر التحصيل والمتابعة',
    proofSupport: 'فريق دعم محلّي في أدرار، يفهم احتياجاتك',
    ctaRegister: 'سجّل متجرك',
    ctaDemo: 'اطلب تجريبية',
    imageAlt: 'تاجر في أدرار يستعمل Crido في متجره',
  },
  fr: {
    eyebrow: 'Pour les marchands',
    heading: "Augmentez vos ventes. On s'occupe du reste.",
    subhead:
      "Crido vous paie intégralement à la vente, prend en charge le recouvrement des mensualités auprès du client, et vous apporte de nouveaux clients qui ne peuvent pas acheter comptant.",
    statSalesLabel: 'Augmentation du volume de vente',
    statDelayLabel: 'Aucun retard de paiement',
    statDelayValue: '0 jour',
    statSupportLabel: 'Support et suivi des ventes',
    proofUpfront: "Vous recevez la totalité du prix à l'avance",
    proofCollection: 'On prend en charge les risques de recouvrement',
    proofSupport: 'Équipe support locale à Adrar, qui comprend vos besoins',
    ctaRegister: 'Inscrivez votre magasin',
    ctaDemo: 'Demandez une démo',
    imageAlt: 'Un marchand à Adrar utilisant Crido dans son magasin',
  },
} as const

type StatKey = 'sales' | 'delay' | 'support'
type ProofKey = 'upfront' | 'collection' | 'support'

const STATS: { key: StatKey; value: string; labelKey: keyof typeof TR.ar; valueKey?: keyof typeof TR.ar }[] = [
  { key: 'sales', value: '+30%', labelKey: 'statSalesLabel' },
  { key: 'delay', value: '', labelKey: 'statDelayLabel', valueKey: 'statDelayValue' },
  { key: 'support', value: '24/7', labelKey: 'statSupportLabel' },
]

const PROOFS: { key: ProofKey; icon: typeof TrendingUp; textKey: keyof typeof TR.ar }[] = [
  { key: 'upfront', icon: TrendingUp, textKey: 'proofUpfront' },
  { key: 'collection', icon: ShieldCheck, textKey: 'proofCollection' },
  { key: 'support', icon: Headset, textKey: 'proofSupport' },
]

export function MerchantBand() {
  const t = useT(TR)

  return (
    <section id="merchants" className="relative overflow-hidden bg-teal-deep py-16 sm:py-20 md:py-24 lg:py-32">
      <div className="glow-pulse pointer-events-none absolute -top-32 -end-32 h-[34rem] w-[34rem] rounded-full bg-teal-bright/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 -start-24 h-[28rem] w-[28rem] rounded-full bg-teal/40 blur-[130px]" />
      {/* Warm amber accent (for the eyebrow color tie-in) */}
      <div className="pointer-events-none absolute top-1/3 start-1/4 h-[14rem] w-[14rem] rounded-full bg-amber/8 blur-[110px] md:h-[20rem] md:w-[20rem]" />

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <span className="drift-1 absolute top-[18%] start-[20%] h-2 w-2 rounded-full bg-teal-bright/40" />
        <span className="drift-2 absolute top-[55%] end-[18%] h-2.5 w-2.5 rounded-full bg-teal-bright/30" />
        <span className="drift-3 absolute top-[30%] start-[45%] h-1.5 w-1.5 rounded-full bg-teal-surface/30" />
        <span className="drift-2 absolute bottom-[25%] end-[40%] h-2 w-2 rounded-full bg-amber/25" />
        <span className="drift-1 absolute top-[70%] start-[12%] h-1 w-1 rounded-full bg-teal-bright/50" />
        <span className="drift-3 absolute top-[12%] end-[35%] h-1 w-1 rounded-full bg-teal-surface/40" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12">
          {/* Left — text + stats + CTAs */}
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber sm:text-sm">
              {t('eyebrow')}
            </p>
            <h2 className="mt-3 text-2xl font-bold leading-tight text-white sm:mt-4 sm:text-3xl md:text-[2.6rem]">
              {t('heading')}
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-teal-surface/75 sm:mt-5 md:text-base lg:text-lg">
              {t('subhead')}
            </p>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:gap-4 sm:p-5 lg:mt-10">
              {STATS.map((s) => (
                <div key={s.key} className="text-center">
                  <p className="latin text-xl font-bold text-teal-bright sm:text-2xl md:text-[1.7rem]">
                    {s.valueKey ? t(s.valueKey) : s.value}
                  </p>
                  <p className="mt-1 text-[0.68rem] leading-tight text-teal-surface/70 sm:text-[0.72rem] md:text-xs">
                    {t(s.labelKey)}
                  </p>
                </div>
              ))}
            </div>

            {/* Proofs */}
            <ul className="mt-6 space-y-3 sm:mt-8">
              {PROOFS.map((p) => (
                <li key={p.key} className="flex items-start gap-3 text-sm text-teal-surface/85 md:text-[0.95rem]">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-bright/15 text-teal-bright">
                    <p.icon size={14} strokeWidth={2} />
                  </span>
                  <span>{t(p.textKey)}</span>
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10">
              <a
                href="#download"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-teal transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(29,158,117,0.45)] sm:px-7 sm:py-3.5"
              >
                {t('ctaRegister')}
                <ArrowLeft size={17} />
              </a>
              <a
                href="#download"
                className="inline-flex min-h-[44px] items-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:px-7 sm:py-3.5"
              >
                {t('ctaDemo')}
              </a>
            </div>
          </Reveal>

          {/* Right — merchant scene visual */}
          <Reveal delay={180}>
            <div className="relative">
              <div className="absolute inset-0 translate-x-3 translate-y-4 rounded-3xl bg-teal-bright/20 blur-2xl sm:rounded-[32px]" />
              <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-white/10 bg-teal/20 shadow-[0_45px_90px_-30px_rgba(0,0,0,0.55)] sm:rounded-[32px]">
                <img
                  src={asset('/images/merchant-scene.png')}
                  alt={t('imageAlt')}
                  className="h-full w-full object-cover object-center"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                {/* Fallback content shown if image missing */}
                <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center gap-3 p-8 text-center text-teal-surface/60">
                  <span className="text-5xl">🏪</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
