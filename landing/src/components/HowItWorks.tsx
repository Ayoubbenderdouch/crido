import { asset } from '@/lib/asset'
import { Smartphone, Store, FileSignature, CalendarCheck } from 'lucide-react'
import { useT } from '@/i18n/useT'
import { Reveal } from './Reveal'

const TR = {
  ar: {
    eyebrow: 'كيف تعمل',
    heading: 'من المتجر إلى جيبك، في أربع خطوات بسيطة.',
    stepLabel: 'الخطوة',
    step1Title: 'حمّل التطبيق وسجّل',
    step1Text: 'أنشئ حسابك في دقائق، وأكمل التحقق من هويتك مرة واحدة فقط.',
    step2Title: 'اختر منتجك من أي متجر',
    step2Text: 'من متجر شريك معروض في التطبيق، أو أي محل آخر في أدرار.',
    step3Title: 'وقّع العقد، ونحن ندفع',
    step3Text: 'بعد الموافقة، تدفع Crido للتاجر مباشرةً وتستلم منتجك في الحال.',
    step4Title: 'ادفع شهرياً بسهولة',
    step4Text: 'أقساط ثابتة معروفة مسبقاً — بدون أي فوائد أو رسوم خفية.',
  },
  fr: {
    eyebrow: 'Comment ça marche',
    heading: 'Du magasin à votre poche, en quatre étapes simples.',
    stepLabel: 'Étape',
    step1Title: "Téléchargez l'app et inscrivez-vous",
    step1Text: "Créez votre compte en quelques minutes, et complétez la vérification d'identité une seule fois.",
    step2Title: "Choisissez votre produit dans n'importe quel magasin",
    step2Text: "Chez un marchand partenaire dans l'app, ou n'importe quelle boutique à Adrar.",
    step3Title: 'Signez le contrat, on paie le marchand',
    step3Text: 'Après approbation, Crido paie directement le marchand et vous recevez votre produit immédiatement.',
    step4Title: 'Payez chaque mois en toute simplicité',
    step4Text: "Mensualités fixes connues à l'avance — sans intérêts ni frais cachés.",
  },
} as const

const STEPS = [
  {
    id: 'step1' as const,
    img: asset('/images/step-1-download.png'),
    icon: Smartphone,
  },
  {
    id: 'step2' as const,
    img: asset('/images/step-2-shop.png'),
    icon: Store,
  },
  {
    id: 'step3' as const,
    img: asset('/images/step-3-sign.png'),
    icon: FileSignature,
  },
  {
    id: 'step4' as const,
    img: asset('/images/step-4-pay.png'),
    icon: CalendarCheck,
  },
]

export function HowItWorks() {
  const t = useT(TR)

  return (
    <section id="how" className="relative overflow-hidden bg-cream py-16 sm:py-20 md:py-24 lg:py-32">
      {/* Floating decorative blobs — adds visual interest at section edges */}
      <div className="pointer-events-none absolute -top-24 -end-24 h-72 w-72 rounded-full bg-teal-surface/50 blur-[90px] sm:h-96 sm:w-96" />
      <div className="drift pointer-events-none absolute -bottom-32 -start-20 h-72 w-72 rounded-full bg-amber/10 blur-[100px] sm:h-96 sm:w-96" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <Reveal>
          <p className="text-xs font-semibold text-teal sm:text-sm">{t('eyebrow')}</p>
          <h2 className="mt-2 max-w-2xl text-2xl font-bold leading-tight tracking-tight text-ink sm:mt-3 sm:text-3xl md:text-[2.6rem]">
            {t('heading')}
          </h2>
        </Reveal>

        {/* Cards container — relative so we can lay a journey line behind */}
        <div className="relative mt-8 sm:mt-12 lg:mt-14">
          {/* ── Journey line (desktop): horizontal dotted line behind the icon row ── */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-[5.4rem] start-[8%] end-[8%] hidden h-px lg:block"
            style={{
              backgroundImage:
                'repeating-linear-gradient(to right, color-mix(in oklab, var(--color-teal) 35%, transparent) 0 6px, transparent 6px 14px)',
            }}
          />
          {/* ── Journey line (mobile/tablet): vertical dotted line on the start side ── */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-12 bottom-12 start-[2.25rem] w-px lg:hidden sm:start-[2.5rem]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(to bottom, color-mix(in oklab, var(--color-teal) 30%, transparent) 0 6px, transparent 6px 14px)',
            }}
          />

          <div className="relative grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {STEPS.map((s, i) => {
              const titleKey = `${s.id}Title` as const
              const textKey = `${s.id}Text` as const
              return (
                <Reveal key={s.id} delay={i * 90}>
                  <div className="card-tilt group relative h-full rounded-3xl border border-line bg-white p-5 hover:border-teal/40 hover:shadow-[0_24px_50px_-30px_rgba(4,36,30,0.35)] md:p-6 lg:p-7">
                    <div className="flex items-start justify-between">
                      {/* Icon tile with subtle teal accent ring */}
                      <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-teal-surface text-teal ring-1 ring-teal/10 ring-offset-2 ring-offset-white transition-all duration-300 group-hover:scale-105 group-hover:bg-teal/10 group-hover:ring-teal/30 sm:h-20 sm:w-20">
                        <img
                          src={s.img}
                          alt=""
                          className="absolute inset-0 h-full w-full object-contain p-1 transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            const img = e.currentTarget
                            img.style.display = 'none'
                          }}
                        />
                        <s.icon
                          size={22}
                          strokeWidth={1.75}
                          className="relative z-0 opacity-0 [.peer-error_~_&]:opacity-100"
                        />
                      </div>

                      {/* Step number — small teal pill instead of giant watermark */}
                      <span
                        className="latin inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-full bg-cream-deep px-2.5 text-sm font-bold text-teal ring-1 ring-teal/15 transition-colors group-hover:bg-teal group-hover:text-white group-hover:ring-teal sm:h-10 sm:min-w-[2.5rem] sm:text-base"
                        aria-label={`${t('stepLabel')} ${i + 1}`}
                      >
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="mt-4 text-base font-bold tracking-tight text-ink sm:mt-6 sm:text-lg">{t(titleKey)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t(textKey)}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
