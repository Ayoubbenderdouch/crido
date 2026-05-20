import { Smartphone, Store, FileSignature, CalendarCheck } from 'lucide-react'
import { Reveal } from './Reveal'

const STEPS = [
  {
    icon: Smartphone,
    title: 'حمّل التطبيق وسجّل',
    text: 'أنشئ حسابك في دقائق، وأكمل التحقق من هويتك مرة واحدة فقط.',
  },
  {
    icon: Store,
    title: 'اختر منتجك من أي متجر',
    text: 'من متجر شريك معروض في التطبيق، أو أي محل آخر في أدرار.',
  },
  {
    icon: FileSignature,
    title: 'وقّع العقد، ونحن ندفع',
    text: 'بعد الموافقة، تدفع Crido للتاجر مباشرةً وتستلم منتجك في الحال.',
  },
  {
    icon: CalendarCheck,
    title: 'ادفع شهرياً بسهولة',
    text: 'أقساط ثابتة معروفة مسبقاً — بدون أي فوائد أو رسوم خفية.',
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="bg-cream py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="text-sm font-semibold text-teal">كيف تعمل</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight text-ink md:text-[2.6rem]">
            من المتجر إلى جيبك، في أربع خطوات بسيطة.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 90}>
              <div className="group h-full rounded-3xl border border-line bg-white p-7 transition-colors hover:border-teal/40">
                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-surface text-teal transition-colors group-hover:bg-teal group-hover:text-white">
                    <s.icon size={22} strokeWidth={1.75} />
                  </span>
                  <span className="latin text-5xl font-bold leading-none text-cream-deep">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-bold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
