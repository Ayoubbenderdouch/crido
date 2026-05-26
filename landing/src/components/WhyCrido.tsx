import {
  BadgePercent,
  ShieldCheck,
  Store,
  Zap,
  Eye,
  Headset,
  type LucideIcon,
} from 'lucide-react'
import { Reveal } from './Reveal'
import { useT } from '@/i18n/useT'

const TR = {
  ar: {
    eyebrow: 'لماذا Crido',
    heading: 'ليس مجرد تقسيط — تجربة دفع مختلفة.',
    intro:
      'Crido مبنية على مبدأ المرابحة — منتج مالي متوافق مع الشريعة، بدون فوائد ولا رسوم خفية. نبدأ بولاية أدرار، ونلتزم بالشفافية الكاملة في كل خطوة.',
    'no-interest-title': 'بدون أي فوائد',
    'no-interest-text': 'السعر النهائي معروف لك من اللحظة الأولى. ما تدفع شي زائد، نعدك.',
    'sharia-title': 'متوافق مع الشريعة',
    'sharia-text': 'هيكل التمويل قائم على المرابحة — هامش ثابت متفق عليه، بدون ربا.',
    'any-store-title': 'من أي متجر في أدرار',
    'any-store-text': 'حتى لو المتجر ما هو شريك معنا، ندخل في وكيل، نتأكد، وندفع بدلك.',
    'fast-approval-title': 'موافقة في دقائق',
    'fast-approval-text': 'أرسل طلبك من التطبيق، وفي أقل من ساعة عادةً تكون عندك الموافقة.',
    'transparency-title': 'شفافية كاملة',
    'transparency-text': 'كل قسط، كل تاريخ، كل مبلغ — تشوفه قبل ما توقع. بدون مفاجآت.',
    'local-support-title': 'مدعوم محلياً',
    'local-support-text': 'فريق دعم في أدرار، يتكلم لغتك، ويفهم احتياجاتك. كل وقت.',
  },
  fr: {
    eyebrow: 'Pourquoi Crido',
    heading: 'Pas juste du paiement échelonné — une expérience de paiement différente.',
    intro:
      'Crido est fondée sur le principe de la Murabaha — un produit financier conforme à la Charia, sans intérêts ni frais cachés. Nous commençons par la Wilaya d\'Adrar, avec un engagement total de transparence à chaque étape.',
    'no-interest-title': 'Zéro intérêt',
    'no-interest-text': 'Le prix final est connu dès le premier instant. Vous ne payez rien de plus, c\'est notre promesse.',
    'sharia-title': 'Conforme à la Charia',
    'sharia-text': 'Structure financière basée sur la Murabaha — marge fixe convenue à l\'avance, sans riba.',
    'any-store-title': 'Dans n\'importe quel magasin d\'Adrar',
    'any-store-text': 'Même si le magasin n\'est pas notre partenaire, on intervient, on vérifie, et on paie pour vous.',
    'fast-approval-title': 'Approbation en quelques minutes',
    'fast-approval-text': 'Envoyez votre demande depuis l\'app et obtenez généralement votre validation en moins d\'une heure.',
    'transparency-title': 'Transparence totale',
    'transparency-text': 'Chaque mensualité, chaque date, chaque montant — visible avant de signer. Aucune surprise.',
    'local-support-title': 'Support local',
    'local-support-text': 'Une équipe support à Adrar, qui parle votre langue et comprend vos besoins. À tout moment.',
  },
} as const

type BenefitSlug =
  | 'no-interest'
  | 'sharia'
  | 'any-store'
  | 'fast-approval'
  | 'transparency'
  | 'local-support'

type Benefit = {
  slug: BenefitSlug
  icon: LucideIcon
}

const BENEFITS: Benefit[] = [
  { slug: 'no-interest', icon: BadgePercent },
  { slug: 'sharia', icon: ShieldCheck },
  { slug: 'any-store', icon: Store },
  { slug: 'fast-approval', icon: Zap },
  { slug: 'transparency', icon: Eye },
  { slug: 'local-support', icon: Headset },
]

export function WhyCrido() {
  const t = useT(TR)
  return (
    <section id="why" className="bg-cream py-16 sm:py-20 md:py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal sm:text-sm">
            {t('eyebrow')}
          </p>
          <h2 className="mt-3 max-w-3xl text-2xl font-bold leading-tight text-ink sm:mt-4 sm:text-3xl md:text-[2.6rem]">
            {t('heading')}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft sm:mt-5 md:text-base lg:text-lg">
            {t('intro')}
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:mt-16 lg:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <Reveal key={b.slug} delay={(i % 3) * 90}>
              <article className="group h-full rounded-3xl border border-line bg-white p-5 transition-colors hover:border-teal/40 md:p-7 lg:p-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-surface text-teal transition-colors group-hover:bg-teal group-hover:text-white sm:h-20 sm:w-20">
                  <img
                    src={`/images/benefit-${b.slug}.png`}
                    alt=""
                    className="h-10 w-10 object-contain sm:h-12 sm:w-12"
                    onError={(e) => {
                      const img = e.currentTarget
                      img.style.display = 'none'
                      const fallback = img.nextElementSibling as HTMLElement | null
                      if (fallback) fallback.style.display = 'inline-flex'
                    }}
                  />
                  <span
                    className="inline-flex items-center justify-center"
                    style={{ display: 'none' }}
                    aria-hidden="true"
                  >
                    <b.icon size={28} strokeWidth={1.75} />
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-ink sm:mt-6 sm:text-xl">
                  {t(`${b.slug}-title` as const)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft sm:mt-3">
                  {t(`${b.slug}-text` as const)}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
