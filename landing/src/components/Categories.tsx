import {
  ArrowUpRight,
  Laptop,
  Refrigerator,
  Smartphone,
  Sofa,
  Tv,
  WashingMachine,
  type LucideIcon,
} from 'lucide-react'
import { dzdSuffix, fmtMoney, useCurrentLocale, useT } from '@/i18n/useT'
import { Reveal } from './Reveal'

const TR = {
  ar: {
    eyebrow: 'الأقسام',
    heading: 'قسّط من جميع الأقسام',
    subhead:
      'إلكترونيات، أثاث، أجهزة منزلية، وأكثر — من أي متجر شريك في أدرار، أو حتى من متجرك المفضّل غير الشريك.',
    fromLabel: 'ابتداءً من',
    cat_phones: 'هواتف ذكية',
    cat_laptops: 'حواسيب',
    cat_tvs: 'تلفزيونات',
    cat_appliances: 'أجهزة منزلية',
    cat_furniture: 'أثاث',
    cat_washing: 'غسّالات وتنظيف',
    ctaLeadStrong: '+ أي منتج آخر',
    ctaLeadRest: 'من متجرك المفضّل في أدرار — حتى لو ما كان شريك معنا.',
    ctaAction: 'شوف كيف',
  },
  fr: {
    eyebrow: 'Catégories',
    heading: 'Payez en plusieurs fois, toutes catégories',
    subhead:
      "Électronique, meubles, électroménager et bien plus — chez un marchand partenaire à Adrar, ou même chez votre boutique préférée non partenaire.",
    fromLabel: 'À partir de',
    cat_phones: 'Smartphones',
    cat_laptops: 'Ordinateurs',
    cat_tvs: 'Téléviseurs',
    cat_appliances: 'Électroménager',
    cat_furniture: 'Meubles',
    cat_washing: 'Machines à laver',
    ctaLeadStrong: "+ N'importe quel autre produit",
    ctaLeadRest: "Chez votre boutique préférée à Adrar — même si elle n'est pas notre partenaire.",
    ctaAction: 'Voir comment',
  },
} as const

type CategorySlug =
  | 'phones'
  | 'laptops'
  | 'tvs'
  | 'appliances'
  | 'furniture'
  | 'washing'

type Category = {
  slug: CategorySlug
  fromDzd: number
  icon: LucideIcon
}

const CATEGORIES: Category[] = [
  { slug: 'phones', fromDzd: 40000, icon: Smartphone },
  { slug: 'laptops', fromDzd: 80000, icon: Laptop },
  { slug: 'tvs', fromDzd: 50000, icon: Tv },
  { slug: 'appliances', fromDzd: 30000, icon: Refrigerator },
  { slug: 'furniture', fromDzd: 25000, icon: Sofa },
  { slug: 'washing', fromDzd: 35000, icon: WashingMachine },
]

function CategoryCard({ category, index }: { category: Category; index: number }) {
  const { slug, fromDzd, icon: Icon } = category
  const t = useT(TR)
  const locale = useCurrentLocale()
  const titleKey = `cat_${slug}` as const
  const title = t(titleKey)

  return (
    <Reveal delay={index * 70}>
      <a
        href={`#categories-${slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-teal/40 hover:shadow-[0_30px_55px_-30px_rgba(4,36,30,0.35)]"
      >
        {/* Image area with tinted background */}
        <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-teal-surface/70 via-cream to-teal-surface/40">
          {/* Soft glow behind product */}
          <div className="pointer-events-none absolute inset-0 m-auto h-3/4 w-3/4 rounded-full bg-teal-bright/10 blur-3xl" />

          {/* Fallback icon (only shown if image fails) */}
          <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/80 text-teal shadow-sm">
              <Icon size={40} strokeWidth={1.4} />
            </span>
          </div>

          {/* The real product image */}
          <img
            src={`/images/category-${slug}.png`}
            alt={title}
            loading="lazy"
            className="relative h-full w-full object-contain p-6 transition-transform duration-500 ease-out group-hover:scale-105 sm:p-7 md:p-8"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between gap-3 p-5 sm:p-6">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-ink md:text-lg">{title}</h3>
            <p className="mt-1 text-xs text-ink-faint md:text-sm">
              {t('fromLabel')}{' '}
              <span className="latin font-semibold text-ink-soft">
                {fmtMoney(fromDzd, locale)}
              </span>{' '}
              {dzdSuffix(locale)}
            </p>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream text-ink-faint transition-all group-hover:bg-teal group-hover:text-white">
            <ArrowUpRight size={17} strokeWidth={2} />
          </span>
        </div>
      </a>
    </Reveal>
  )
}

export function Categories() {
  const t = useT(TR)

  return (
    <section id="categories" className="relative overflow-hidden bg-cream-deep py-16 sm:py-20 md:py-24 lg:py-32">
      {/* Soft ambient blob in the top corner */}
      <div className="pointer-events-none absolute -top-20 -end-20 h-[20rem] w-[20rem] rounded-full bg-teal-surface/50 blur-[110px] md:h-[28rem] md:w-[28rem]" />
      <div className="pointer-events-none absolute bottom-10 -start-20 h-[16rem] w-[16rem] rounded-full bg-teal-bright/6 blur-[120px] md:h-[22rem] md:w-[22rem]" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal sm:text-sm">
            {t('eyebrow')}
          </p>
          <h2 className="mt-3 max-w-2xl text-2xl font-bold leading-tight text-ink sm:mt-4 sm:text-3xl md:text-[2.6rem]">
            {t('heading')}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft sm:mt-4 md:text-base lg:text-lg">
            {t('subhead')}
          </p>
        </Reveal>

        {/* 6 Tamara-style category cards */}
        <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {CATEGORIES.map((c, i) => (
            <CategoryCard key={c.slug} category={c} index={i} />
          ))}
        </div>

        {/* Bottom CTA strip */}
        <Reveal delay={140}>
          <div className="mt-10 flex flex-col items-start gap-3 rounded-3xl border border-line bg-white px-5 py-4 sm:mt-12 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-5">
            <p className="text-sm text-ink-soft md:text-base">
              <span className="font-semibold text-ink">{t('ctaLeadStrong')}</span>{' '}
              {t('ctaLeadRest')}
            </p>
            <a
              href="#how"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal transition-colors hover:text-teal-bright"
            >
              {t('ctaAction')}
              <ArrowUpRight size={16} strokeWidth={2.2} className="rtl:rotate-90" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
