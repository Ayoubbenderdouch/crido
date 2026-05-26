import { asset } from '@/lib/asset'
import { ArrowLeft, Check } from 'lucide-react'
import { useT } from '@/i18n/useT'

const TR = {
  ar: {
    availability: 'متوفّرة الآن في ولاية أدرار',
    headline1: 'اشترِ ما تحتاج،',
    headline2: 'وادفعه',
    headline3: 'على راحتك',
    period: '.',
    subhead:
      'Crido تتيح لك شراء هاتفك أو جهازك من أي متجر في أدرار، والدفع على 4 أو 6 أو 12 شهراً — بأقساط واضحة، وبدون أي فوائد.',
    ctaDownload: 'حمّل تطبيق Crido',
    ctaMerchant: 'أنا تاجر',
    check1: 'بدون فوائد',
    check2: 'من أي متجر',
    check3: 'موافقة سريعة',
    heroAlt: 'Crido — اشترِ بأقساط من أي متجر في أدرار',
  },
  fr: {
    availability: "Disponible maintenant à la Wilaya d'Adrar",
    headline1: 'Achetez ce dont vous avez besoin,',
    headline2: 'payez',
    headline3: 'à votre rythme',
    period: '.',
    subhead:
      "Crido vous permet d'acheter votre téléphone ou appareil depuis n'importe quel magasin à Adrar, et de payer en 4, 6 ou 12 mensualités — claires et sans aucun intérêt.",
    ctaDownload: "Téléchargez l'app Crido",
    ctaMerchant: 'Je suis marchand',
    check1: 'Sans intérêts',
    check2: "N'importe quel magasin",
    check3: 'Approbation rapide',
    heroAlt: "Crido — achetez en plusieurs fois depuis n'importe quel magasin à Adrar",
  },
} as const

export function Hero() {
  const t = useT(TR)
  const checks = [t('check1'), t('check2'), t('check3')]

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-teal-deep pt-24 pb-16 sm:pt-28 sm:pb-20 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32"
    >
      {/* Decorative glows */}
      <div className="glow-pulse pointer-events-none absolute -top-40 -start-40 h-[26rem] w-[26rem] rounded-full bg-teal-bright/20 blur-[120px] md:h-[40rem] md:w-[40rem] md:blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 -end-24 h-[22rem] w-[22rem] rounded-full bg-teal/45 blur-[110px] md:h-[34rem] md:w-[34rem] md:blur-[130px]" />
      {/* Warm amber blob at bottom-center for warmth */}
      <div className="pointer-events-none absolute -bottom-32 start-1/2 h-[20rem] w-[20rem] -translate-x-1/2 rounded-full bg-amber/10 blur-[120px] md:h-[28rem] md:w-[28rem] md:blur-[140px] rtl:translate-x-1/2" />

      {/* Subtle dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)',
          backgroundSize: '38px 38px',
        }}
      />

      {/* Floating particles — cinematic living surface */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <span className="drift-1 absolute top-[20%] start-[15%] h-2 w-2 rounded-full bg-teal-bright/40" />
        <span className="drift-2 absolute top-[60%] end-[25%] h-3 w-3 rounded-full bg-teal-bright/25" />
        <span className="drift-3 absolute top-[35%] end-[10%] h-1.5 w-1.5 rounded-full bg-teal-surface/30" />
        <span className="drift-1 absolute bottom-[20%] start-[40%] h-2 w-2 rounded-full bg-amber/30" />
        <span className="drift-2 absolute top-[75%] start-[55%] h-1 w-1 rounded-full bg-teal-bright/50" />
        <span className="drift-3 absolute top-[15%] end-[40%] h-1 w-1 rounded-full bg-teal-surface/40" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 sm:gap-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        {/* LEFT — text + CTAs */}
        <div className="text-center lg:text-start">
          <span
            className="rise inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[13px] text-teal-surface sm:px-4 sm:text-sm"
            style={{ animationDelay: '0ms' }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber" />
            {t('availability')}
          </span>

          <h1
            className="rise mt-5 text-[2rem] font-bold leading-[1.15] tracking-tight text-white sm:mt-6 sm:text-5xl md:text-[3.7rem] md:leading-[1.18]"
            style={{ animationDelay: '90ms' }}
          >
            {t('headline1')}
            <br />
            {t('headline2')} <span className="text-teal-bright">{t('headline3')}</span>
            {t('period')}
          </h1>

          <p
            className="rise mx-auto mt-5 max-w-md text-base leading-relaxed text-teal-surface/80 sm:mt-6 sm:text-lg lg:mx-0"
            style={{ animationDelay: '170ms' }}
          >
            {t('subhead')}
          </p>

          <div
            className="rise mt-7 flex flex-col items-stretch gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3 lg:justify-start"
            style={{ animationDelay: '250ms' }}
          >
            <a
              href="#download"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-teal shadow-[0_18px_36px_-18px_rgba(0,0,0,0.45)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_18px_36px_-12px_rgba(29,158,117,0.55)] active:scale-[0.99]"
            >
              {t('ctaDownload')}
              <ArrowLeft size={17} />
            </a>
            <a
              href="#merchants"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 active:bg-white/15"
            >
              {t('ctaMerchant')}
            </a>
          </div>

          <ul
            className="rise mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px] text-teal-surface/75 sm:mt-10 sm:gap-x-6 sm:text-sm lg:justify-start"
            style={{ animationDelay: '330ms' }}
          >
            {checks.map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <Check size={15} className="text-teal-bright" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT — Hero character (big on desktop, contained on mobile) */}
        <div
          className="rise relative flex items-center justify-center"
          style={{ animationDelay: '210ms' }}
        >
          {/* Soft glow behind the character */}
          <div className="pointer-events-none absolute inset-0 -z-10 mx-auto h-[16rem] w-[16rem] rounded-full bg-teal-bright/12 blur-[80px] sm:h-[22rem] sm:w-[22rem] sm:blur-[100px] md:h-[26rem] md:w-[26rem]" />

          <img
            src={asset('/images/hero-character.png')}
            alt={t('heroAlt')}
            className="floaty h-auto w-full max-w-[16rem] object-contain sm:max-w-[22rem] md:max-w-[26rem] lg:max-w-[32rem] xl:max-w-[36rem]"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      </div>
    </section>
  )
}
