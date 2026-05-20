import { Store, MapPin, Check } from 'lucide-react'
import { Reveal } from './Reveal'

const PARTNER = [
  'معروضة مباشرةً في كتالوج التطبيق',
  'منتجات وأسعار جاهزة للاختيار',
  'تأكيد سريع من التاجر نفسه',
]

const ADHOC = [
  'تُدخل اسم المحل ورقمه وعنوانه',
  'فريق Crido يتصل بالمحل ويتحقق منه',
  'ثم تُكمل تمويلك بشكل عادي تماماً',
]

export function TwoPaths() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="text-sm font-semibold text-teal">ما يميّز Crido</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight text-ink md:text-[2.6rem]">
            موّل من أي متجر — وليس فقط من المتاجر الشريكة.
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
            سواء كان المحل شريكاً معنا أو لا، تستطيع تمويل مشترياتك منه. هذا ما يجعل
            Crido مختلفة.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-3xl bg-teal-deep p-8 text-white">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-teal-bright">
                <Store size={22} strokeWidth={1.75} />
              </span>
              <h3 className="mt-6 text-xl font-bold">متجر شريك</h3>
              <p className="mt-2 text-sm leading-relaxed text-teal-surface/70">
                متاجر تعاقدت مع Crido، تجد منتجاتها داخل التطبيق مباشرةً.
              </p>
              <ul className="mt-6 space-y-3">
                {PARTNER.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-sm text-teal-surface/90">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-bright text-teal-deep">
                      <Check size={13} strokeWidth={3} />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="h-full rounded-3xl border border-line bg-cream p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-surface text-teal">
                <MapPin size={22} strokeWidth={1.75} />
              </span>
              <h3 className="mt-6 text-xl font-bold text-ink">أي متجر آخر</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                وجدت ما تريد في محل غير شريك؟ لا مشكلة — نتحقق منه ونكمل معك.
              </p>
              <ul className="mt-6 space-y-3">
                {ADHOC.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-sm text-ink">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal text-white">
                      <Check size={13} strokeWidth={3} />
                    </span>
                    {p}
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
