import { ArrowLeft, Smartphone, BadgeCheck, Check } from 'lucide-react'

const DURATIONS = [
  { m: '4 أشهر', active: false },
  { m: '6 أشهر', active: false },
  { m: '12 شهر', active: true },
]

function FinancingCard() {
  return (
    <div className="floaty relative mx-auto w-full max-w-sm">
      <div className="absolute inset-0 translate-x-4 translate-y-6 rounded-[30px] bg-teal-bright/25" />
      <div className="absolute inset-0 -translate-x-3 translate-y-3 rounded-[30px] bg-white/10" />

      <div className="relative rounded-[30px] border border-white/70 bg-white p-6 shadow-[0_40px_80px_-28px_rgba(4,36,30,0.65)]">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-surface text-teal">
            <Smartphone size={22} strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-ink">iPhone 16</p>
            <p className="text-xs text-ink-faint">من متجر شريك في أدرار</p>
          </div>
        </div>

        <div className="mt-5 flex items-baseline justify-between">
          <span className="text-sm text-ink-soft">سعر المنتج</span>
          <span className="latin text-lg font-bold text-ink">200,000 دج</span>
        </div>

        <div className="mt-4 border-t border-line" />

        <p className="mt-4 text-sm text-ink-soft">اختر مدة التقسيط</p>
        <div className="mt-2 flex gap-2">
          {DURATIONS.map((d) => (
            <span
              key={d.m}
              className={`flex-1 rounded-xl py-2 text-center text-sm font-semibold ${
                d.active ? 'bg-teal text-white' : 'bg-cream text-ink-faint'
              }`}
            >
              {d.m}
            </span>
          ))}
        </div>

        <div className="mt-4 rounded-2xl bg-teal-deep p-5 text-white">
          <p className="text-xs text-teal-surface/70">قسطك الشهري</p>
          <p className="latin mt-1 text-[2rem] font-bold leading-none">19,166 دج</p>
          <p className="mt-2 text-xs text-teal-surface/70">12 قسطاً متساوياً · بدون أي فوائد</p>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-teal">
          <BadgeCheck size={16} />
          السعر النهائي ثابت ومعروف لك مُسبقاً
        </div>
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-teal-deep pt-32 pb-24 md:pt-40 md:pb-32">
      <div className="glow-pulse pointer-events-none absolute -top-40 -start-40 h-[40rem] w-[40rem] rounded-full bg-teal-bright/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-48 -end-32 h-[34rem] w-[34rem] rounded-full bg-teal/45 blur-[130px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)',
          backgroundSize: '38px 38px',
        }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span
            className="rise inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-teal-surface"
            style={{ animationDelay: '0ms' }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber" />
            متوفّرة الآن في ولاية أدرار
          </span>

          <h1
            className="rise mt-6 text-4xl font-bold leading-[1.18] text-white sm:text-5xl md:text-[3.7rem]"
            style={{ animationDelay: '90ms' }}
          >
            اشترِ ما تحتاج،
            <br />
            وادفعه <span className="text-teal-bright">على راحتك</span>.
          </h1>

          <p
            className="rise mt-6 max-w-md text-lg leading-relaxed text-teal-surface/80"
            style={{ animationDelay: '170ms' }}
          >
            Crido تتيح لك شراء هاتفك أو جهازك من أي متجر في أدرار، والدفع على 4 أو 6 أو
            12 شهراً — بأقساط واضحة، وبدون أي فوائد.
          </p>

          <div
            className="rise mt-8 flex flex-wrap items-center gap-3"
            style={{ animationDelay: '250ms' }}
          >
            <a
              href="#download"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-teal transition-transform hover:scale-[1.03]"
            >
              حمّل تطبيق Crido
              <ArrowLeft size={17} />
            </a>
            <a
              href="#merchants"
              className="inline-flex items-center rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              أنا تاجر
            </a>
          </div>

          <div
            className="rise mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-teal-surface/70"
            style={{ animationDelay: '330ms' }}
          >
            {['بدون فوائد', 'من أي متجر', 'موافقة سريعة'].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5">
                <Check size={15} className="text-teal-bright" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="rise" style={{ animationDelay: '210ms' }}>
          <FinancingCard />
        </div>
      </div>
    </section>
  )
}
