import type { ReactNode } from 'react'
import { ShieldCheck } from 'lucide-react'
import { useT } from '@/i18n/useT'

/** Instagram glyph (brand icons aren't in lucide). */
function Instagram() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

/** Facebook glyph. */
function Facebook() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

/** X (Twitter) glyph. */
function Twitter() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}
import { Reveal } from './Reveal'

/** TikTok glyph — lucide doesn't ship one. */
function TikTokIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.9a8.16 8.16 0 0 0 4.77 1.52V7a4.85 4.85 0 0 1-1.84-.31z" />
    </svg>
  )
}

const TR = {
  ar: {
    ctaHeading: 'جاهز تجرّب أول تقسيط؟',
    ctaSub: 'حمّل التطبيق وابدأ في 5 دقائق',
    appStoreEyebrow: 'حمّله من',
    googlePlayEyebrow: 'احصل عليه من',
    appStoreAria: 'حمّله من App Store',
    googlePlayAria: 'احصل عليه من Google Play',
    tagline: 'قسّط ما تحتاج، ادفع براحتك.',
    colAbout: 'عن Crido',
    colCustomers: 'للعملاء',
    colMerchants: 'للتجار',
    colLegal: 'قانوني',
    aboutWho: 'من نحن',
    aboutTeam: 'الفريق',
    aboutNews: 'الأخبار',
    aboutCareers: 'الوظائف',
    aboutContact: 'تواصل معنا',
    customersHow: 'كيف تعمل',
    customersPlans: 'الخطط والأقساط',
    customersFaq: 'الأسئلة الشائعة',
    customersHelp: 'مركز المساعدة',
    customersTerms: 'شروط الاستخدام',
    merchantsJoin: 'انضم كتاجر',
    merchantsDashboard: 'لوحة التحكم',
    merchantsGuide: 'دليل التاجر',
    merchantsPricing: 'الأسعار والعمولات',
    merchantsCases: 'دراسات حالة',
    legalTerms: 'شروط الخدمة',
    legalPrivacy: 'سياسة الخصوصية',
    legalSharia: 'الالتزام بالشريعة',
    legalSecurity: 'الأمان والحماية',
    legalBank: 'بنك الجزائر',
    trustSharia: 'متوافق مع الشريعة الإسلامية',
    trustRegion: 'متوفّر في أدرار · قريباً في كامل الجزائر',
    copyright: '© 2026 Crido. مصنوع بحب في الجزائر 🇩🇿',
  },
  fr: {
    ctaHeading: 'Prêt(e) à essayer votre premier paiement échelonné ?',
    ctaSub: "Téléchargez l'app et commencez en 5 minutes",
    appStoreEyebrow: 'Téléchargez sur',
    googlePlayEyebrow: 'Disponible sur',
    appStoreAria: "Téléchargez sur l'App Store",
    googlePlayAria: 'Disponible sur Google Play',
    tagline: "Achetez ce dont vous avez besoin en plusieurs fois, payez à votre rythme.",
    colAbout: 'À propos',
    colCustomers: 'Pour les clients',
    colMerchants: 'Pour les marchands',
    colLegal: 'Légal',
    aboutWho: 'Qui sommes-nous',
    aboutTeam: 'Équipe',
    aboutNews: 'Actualités',
    aboutCareers: 'Carrières',
    aboutContact: 'Nous contacter',
    customersHow: 'Comment ça marche',
    customersPlans: 'Plans et mensualités',
    customersFaq: 'Questions fréquentes',
    customersHelp: "Centre d'aide",
    customersTerms: "Conditions d'utilisation",
    merchantsJoin: 'Devenir marchand',
    merchantsDashboard: 'Tableau de bord',
    merchantsGuide: 'Guide du marchand',
    merchantsPricing: 'Tarifs et commissions',
    merchantsCases: 'Études de cas',
    legalTerms: 'Conditions de service',
    legalPrivacy: 'Politique de confidentialité',
    legalSharia: 'Engagement Charia',
    legalSecurity: 'Sécurité et protection',
    legalBank: "Banque d'Algérie",
    trustSharia: 'Conforme à la Charia islamique',
    trustRegion: "Disponible à Adrar · Bientôt dans toute l'Algérie",
    copyright: '© 2026 Crido. Fait avec amour en Algérie 🇩🇿',
  },
} as const

type TKey = keyof typeof TR.ar
type LinkItem = { labelKey: TKey; href: string }

const ABOUT: LinkItem[] = [
  { labelKey: 'aboutWho', href: '#' },
  { labelKey: 'aboutTeam', href: '#' },
  { labelKey: 'aboutNews', href: '#' },
  { labelKey: 'aboutCareers', href: '#' },
  { labelKey: 'aboutContact', href: '#' },
]

const CUSTOMERS: LinkItem[] = [
  { labelKey: 'customersHow', href: '#how' },
  { labelKey: 'customersPlans', href: '#plans' },
  { labelKey: 'customersFaq', href: '#faq' },
  { labelKey: 'customersHelp', href: '#' },
  { labelKey: 'customersTerms', href: '#' },
]

const MERCHANTS: LinkItem[] = [
  { labelKey: 'merchantsJoin', href: '#merchants' },
  { labelKey: 'merchantsDashboard', href: '#' },
  { labelKey: 'merchantsGuide', href: '#' },
  { labelKey: 'merchantsPricing', href: '#' },
  { labelKey: 'merchantsCases', href: '#' },
]

const LEGAL: LinkItem[] = [
  { labelKey: 'legalTerms', href: '#' },
  { labelKey: 'legalPrivacy', href: '#' },
  { labelKey: 'legalSharia', href: '#' },
  { labelKey: 'legalSecurity', href: '#' },
  { labelKey: 'legalBank', href: '#' },
]

function LinkColumn({
  title,
  links,
  t,
}: {
  title: string
  links: LinkItem[]
  t: (key: TKey) => string
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-bold text-white md:mb-4 md:text-base">{title}</p>
      <ul className="space-y-2 md:space-y-2.5">
        {links.map((l) => (
          <li key={l.labelKey}>
            <a
              href={l.href}
              className="text-sm text-teal-surface/70 transition-colors hover:text-white"
            >
              {t(l.labelKey)}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: ReactNode
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/90 transition-colors hover:bg-white/20 hover:text-white"
    >
      {children}
    </a>
  )
}

export function Footer() {
  const t = useT(TR)

  return (
    <footer id="download" className="bg-teal-deep text-white">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 md:py-16 lg:py-20">
        {/* ── CTA banner ───────────────────────────────────── */}
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-teal-bright px-6 py-8 sm:px-7 sm:py-9 md:px-12 md:py-12">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.18]"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)',
                backgroundSize: '28px 28px',
              }}
            />
            <div className="pointer-events-none absolute -bottom-20 -end-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

            <div className="relative grid items-center gap-6 md:grid-cols-[1.2fr_1fr] md:gap-7">
              <div>
                <h3 className="text-xl font-bold leading-tight text-white sm:text-2xl md:text-[2rem]">
                  {t('ctaHeading')}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/85 sm:mt-3 sm:text-base">
                  {t('ctaSub')}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 md:justify-end">
                <a
                  href="#download"
                  aria-label={t('appStoreAria')}
                  className="group inline-flex h-13 min-w-[160px] items-center gap-3 rounded-2xl bg-ink px-4 text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#111] sm:h-14 sm:min-w-[170px] sm:px-5"
                  style={{ height: '52px' }}
                >
                  <svg viewBox="0 0 384 512" className="h-6 w-6 shrink-0" fill="currentColor" aria-hidden="true">
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM262.1 104.5c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                  </svg>
                  <span className="flex flex-col leading-none text-start">
                    <span className="text-[0.65rem] font-medium text-white/65">{t('appStoreEyebrow')}</span>
                    <span className="latin mt-0.5 text-sm font-bold tracking-tight">App Store</span>
                  </span>
                </a>
                <a
                  href="#download"
                  aria-label={t('googlePlayAria')}
                  className="group inline-flex h-13 min-w-[160px] items-center gap-3 rounded-2xl bg-ink px-4 text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#111] sm:h-14 sm:min-w-[170px] sm:px-5"
                  style={{ height: '52px' }}
                >
                  <svg viewBox="0 0 26 24" className="h-6 w-6 shrink-0" aria-hidden="true">
                    <polygon points="5,2.6 5,12 11,12" fill="#00C3F7" />
                    <polygon points="5,12 5,21.4 11,12" fill="#FF424B" />
                    <polygon points="5,2.6 22,12 11,12" fill="#22C55E" />
                    <polygon points="5,21.4 22,12 11,12" fill="#FFC72C" />
                  </svg>
                  <span className="flex flex-col leading-none text-start">
                    <span className="text-[0.65rem] font-medium text-white/65">{t('googlePlayEyebrow')}</span>
                    <span className="latin mt-0.5 text-sm font-bold tracking-tight">Google Play</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── Footer grid ──────────────────────────────────── */}
        <Reveal>
          <div className="mt-12 grid gap-10 sm:grid-cols-2 md:mt-16 md:gap-10 lg:grid-cols-5">
            {/* Brand column — shown first on every breakpoint */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="inline-flex items-center gap-2">
                <span className="text-2xl font-bold text-white">Crido</span>
                <span className="inline-block h-2 w-2 rounded-full bg-teal-bright" />
              </div>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-teal-surface/70 md:mt-4">
                {t('tagline')}
              </p>
              <div className="mt-4 flex items-center gap-2 md:mt-5">
                <SocialIcon href="#" label="Instagram">
                  <Instagram />
                </SocialIcon>
                <SocialIcon href="#" label="Facebook">
                  <Facebook />
                </SocialIcon>
                <SocialIcon href="#" label="TikTok">
                  <TikTokIcon />
                </SocialIcon>
                <SocialIcon href="#" label="X">
                  <Twitter />
                </SocialIcon>
              </div>
            </div>

            <LinkColumn title={t('colAbout')} links={ABOUT} t={t} />
            <LinkColumn title={t('colCustomers')} links={CUSTOMERS} t={t} />
            <LinkColumn title={t('colMerchants')} links={MERCHANTS} t={t} />
            <LinkColumn title={t('colLegal')} links={LEGAL} t={t} />
          </div>
        </Reveal>

        {/* ── Trust / region strip ────────────────────────── */}
        <div className="mt-10 flex flex-col items-center justify-center gap-2 rounded-2xl bg-white/[0.04] px-5 py-3.5 text-center text-xs text-teal-surface/70 sm:flex-row sm:flex-wrap sm:gap-3 md:mt-14">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-teal-bright" />
            {t('trustSharia')}
          </span>
          <span className="hidden h-1 w-1 rounded-full bg-teal-surface/30 sm:inline-block" />
          <span>{t('trustRegion')}</span>
        </div>

        {/* ── Bottom strip ───────────────────────────────── */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-teal-surface/15 pt-6 text-sm text-teal-surface/60 sm:flex-row md:mt-10 md:pt-7">
          <p className="text-center sm:text-start">{t('copyright')}</p>
          <div className="flex items-center gap-3 text-xs">
            <a href="#" className="text-white transition-colors hover:text-teal-bright">
              العربية
            </a>
            <span className="text-teal-surface/30">|</span>
            <a
              href="#"
              className="latin text-teal-surface/60 transition-colors hover:text-white"
            >
              Français
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
