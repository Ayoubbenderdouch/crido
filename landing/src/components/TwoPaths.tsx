import { Store, MapPin, Check, PhoneCall, Sparkles, BadgeCheck, type LucideIcon } from 'lucide-react'
import { Reveal } from './Reveal'
import { useT } from '@/i18n/useT'

const TR = {
  ar: {
    eyebrow: 'ما يميّز Crido',
    heading: 'موّل من أي متجر — وليس فقط من المتاجر الشريكة.',
    subhead: 'سواء كان المحل شريكاً معنا أو لا، تستطيع تمويل مشترياتك منه. هذا ما يجعل Crido مختلفة.',
    or: 'أو',
    partnerLabel: 'المسار الأول',
    partnerTitle: 'متجر شريك',
    partnerDesc: 'متاجر تعاقدت مع Crido، تجد منتجاتها داخل التطبيق مباشرةً.',
    partner1: 'معروضة مباشرةً في كتالوج التطبيق',
    partner2: 'منتجات وأسعار جاهزة للاختيار',
    partner3: 'تأكيد سريع من التاجر نفسه',
    adhocLabel: 'المسار الثاني',
    adhocTitle: 'أي متجر آخر',
    adhocDesc: 'وجدت ما تريد في محل غير شريك؟ لا مشكلة — نتحقق منه ونكمل معك.',
    adhoc1: 'تُدخل اسم المحل ورقمه وعنوانه',
    adhoc2: 'فريق Crido يتصل بالمحل ويتحقق منه',
    adhoc3: 'ثم تُكمل تمويلك بشكل عادي تماماً',
  },
  fr: {
    eyebrow: 'Ce qui distingue Crido',
    heading: 'Financez dans n\'importe quel magasin — pas seulement chez nos partenaires.',
    subhead: 'Que le magasin soit partenaire ou non, vous pouvez financer vos achats. C\'est ce qui rend Crido différent.',
    or: 'OU',
    partnerLabel: 'Première voie',
    partnerTitle: 'Marchand partenaire',
    partnerDesc: 'Des marchands sous contrat avec Crido, dont les produits apparaissent directement dans l\'app.',
    partner1: 'Affichés directement dans le catalogue de l\'app',
    partner2: 'Produits et prix prêts à être choisis',
    partner3: 'Confirmation rapide directement par le marchand',
    adhocLabel: 'Deuxième voie',
    adhocTitle: 'N\'importe quel autre magasin',
    adhocDesc: 'Vous avez trouvé ce que vous voulez chez un magasin non partenaire ? Aucun souci — on le vérifie et on continue avec vous.',
    adhoc1: 'Vous saisissez le nom, le numéro et l\'adresse du magasin',
    adhoc2: 'L\'équipe Crido appelle le marchand et le vérifie',
    adhoc3: 'Ensuite, vous finalisez votre financement normalement',
  },
} as const

type BulletKey =
  | 'partner1'
  | 'partner2'
  | 'partner3'
  | 'adhoc1'
  | 'adhoc2'
  | 'adhoc3'

const PARTNER: { icon: LucideIcon; key: BulletKey }[] = [
  { icon: Sparkles, key: 'partner1' },
  { icon: BadgeCheck, key: 'partner2' },
  { icon: Check, key: 'partner3' },
]

const ADHOC: { icon: LucideIcon; key: BulletKey }[] = [
  { icon: MapPin, key: 'adhoc1' },
  { icon: PhoneCall, key: 'adhoc2' },
  { icon: Check, key: 'adhoc3' },
]

export function TwoPaths() {
  const t = useT(TR)
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 md:py-24 lg:py-32">
      {/* Subtle teal halo behind the comparison */}
      <div className="pointer-events-none absolute top-1/3 start-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-teal-surface/40 blur-[110px] sm:h-96 sm:w-96 rtl:translate-x-1/2" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <Reveal>
          <p className="text-xs font-semibold text-teal sm:text-sm">{t('eyebrow')}</p>
          <h2 className="mt-2 max-w-2xl text-2xl font-bold leading-tight tracking-tight text-ink sm:mt-3 sm:text-3xl md:text-[2.6rem]">
            {t('heading')}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft sm:mt-4 md:text-base lg:text-lg">
            {t('subhead')}
          </p>
        </Reveal>

        <div className="relative mt-8 grid gap-4 sm:mt-10 sm:gap-5 md:mt-12 md:grid-cols-2 md:gap-6 lg:gap-8">
          {/* "أو" divider — between the two cards */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute start-1/2 top-1/2 z-10 hidden h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xs font-bold text-teal shadow-[0_8px_24px_-8px_rgba(4,36,30,0.35)] ring-1 ring-line md:flex rtl:translate-x-1/2"
          >
            {t('or')}
          </div>

          <Reveal>
            <div className="card-tilt group relative h-full overflow-hidden rounded-3xl bg-teal-deep p-5 text-white shadow-[0_30px_60px_-35px_rgba(4,36,30,0.55)] md:p-7 lg:p-8">
              {/* Soft brand glow */}
              <div className="pointer-events-none absolute -end-12 -top-12 h-40 w-40 rounded-full bg-teal-bright/20 blur-[60px] transition-opacity duration-500 group-hover:opacity-100" />

              {/* Path label pill */}
              <span className="relative inline-flex items-center gap-1.5 rounded-full bg-amber/20 px-2.5 py-1 text-[11px] font-semibold text-amber">
                {t('partnerLabel')}
              </span>

              <div className="relative mt-4 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-teal-bright ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105">
                  <Store size={22} strokeWidth={1.75} />
                </span>
                <h3 className="text-lg font-bold tracking-tight sm:text-xl">{t('partnerTitle')}</h3>
              </div>

              <p className="relative mt-3 text-sm leading-relaxed text-teal-surface/75">
                {t('partnerDesc')}
              </p>
              <ul className="relative mt-5 space-y-3 sm:mt-6">
                {PARTNER.map((p) => (
                  <li key={p.key} className="flex items-start gap-3 text-sm text-teal-surface/90">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-bright/15 text-teal-bright ring-1 ring-teal-bright/30">
                      <p.icon size={12} strokeWidth={2.4} />
                    </span>
                    <span>{t(p.key)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="card-tilt group relative h-full overflow-hidden rounded-3xl border border-line bg-cream p-5 hover:border-teal/30 md:p-7 lg:p-8">
              {/* Subtle teal accent glow */}
              <div className="pointer-events-none absolute -end-16 -bottom-16 h-44 w-44 rounded-full bg-teal/8 blur-[70px]" />

              <span className="relative inline-flex items-center gap-1.5 rounded-full bg-teal/10 px-2.5 py-1 text-[11px] font-semibold text-teal">
                {t('adhocLabel')}
              </span>

              <div className="relative mt-4 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-surface text-teal ring-1 ring-teal/15 transition-transform duration-300 group-hover:scale-105">
                  <MapPin size={22} strokeWidth={1.75} />
                </span>
                <h3 className="text-lg font-bold tracking-tight text-ink sm:text-xl">{t('adhocTitle')}</h3>
              </div>

              <p className="relative mt-3 text-sm leading-relaxed text-ink-soft">
                {t('adhocDesc')}
              </p>
              <ul className="relative mt-5 space-y-3 sm:mt-6">
                {ADHOC.map((p) => (
                  <li key={p.key} className="flex items-start gap-3 text-sm text-ink">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal text-white ring-1 ring-teal/30">
                      <p.icon size={12} strokeWidth={2.4} />
                    </span>
                    <span>{t(p.key)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
