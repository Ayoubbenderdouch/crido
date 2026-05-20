import { Check } from 'lucide-react'
import { Reveal } from './Reveal'

const PLANS = [
  {
    months: '4 أشهر',
    monthly: '52,500',
    total: '210,000',
    margin: 'هامش 5%',
    note: 'للمشتريات الصغيرة والمتوسطة.',
    featured: false,
  },
  {
    months: '6 أشهر',
    monthly: '36,000',
    total: '216,000',
    margin: 'هامش 8%',
    note: 'توازن مريح بين القسط والمدة.',
    featured: false,
  },
  {
    months: '12 شهراً',
    monthly: '19,167',
    total: '230,000',
    margin: 'هامش 15%',
    note: 'الأنسب للمشتريات الكبيرة.',
    featured: true,
  },
]

export function Plans() {
  return (
    <section id="plans" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="text-sm font-semibold text-teal">الخطط</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight text-ink md:text-[2.6rem]">
            اختر المدة التي تناسبك.
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            مثال توضيحي على مشترى بقيمة <span className="latin font-semibold text-ink">200,000 دج</span>.
          </p>
        </Reveal>

        <div className="mt-14 grid items-stretch gap-5 md:grid-cols-3">
          {PLANS.map((p, i) => (
            <Reveal key={p.months} delay={i * 110}>
              <div
                className={`flex h-full flex-col rounded-3xl p-8 ${
                  p.featured
                    ? 'bg-teal-deep text-white ring-1 ring-teal-bright/40'
                    : 'border border-line bg-cream text-ink'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">{p.months}</span>
                  {p.featured ? (
                    <span className="rounded-full bg-amber px-3 py-1 text-xs font-semibold text-teal-deep">
                      الأكثر اختياراً
                    </span>
                  ) : null}
                </div>

                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="latin text-4xl font-bold">{p.monthly}</span>
                  <span className={p.featured ? 'text-teal-surface/70' : 'text-ink-faint'}>
                    دج / شهر
                  </span>
                </div>

                <p className={`mt-2 text-sm ${p.featured ? 'text-teal-surface/70' : 'text-ink-soft'}`}>
                  {p.margin} · المجموع <span className="latin">{p.total}</span> دج
                </p>

                <div
                  className={`my-6 border-t ${p.featured ? 'border-white/15' : 'border-line'}`}
                />

                <p className={`text-sm leading-relaxed ${p.featured ? 'text-teal-surface/80' : 'text-ink-soft'}`}>
                  {p.note}
                </p>

                <div className="mt-6 flex items-center gap-2 text-sm font-medium">
                  <Check size={16} className={p.featured ? 'text-teal-bright' : 'text-teal'} />
                  بدون أي فوائد
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
