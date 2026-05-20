import { Ban, Store, Eye, Zap, CalendarRange, ShieldCheck } from 'lucide-react'
import { Reveal } from './Reveal'

const FEATURES = [
  {
    icon: Ban,
    title: 'بدون فوائد إطلاقاً',
    text: 'هيكلة مرابحة: هامش ثابت ومعروف، بلا فوائد ولا غرامات تأخير.',
  },
  {
    icon: Store,
    title: 'من أي متجر',
    text: 'لست مقيّداً بمتاجر معيّنة — موّل مشترياتك من أي محل في أدرار.',
  },
  {
    icon: Eye,
    title: 'شفافية كاملة',
    text: 'تعرف قيمة القسط والمجموع النهائي قبل أن توقّع أي شيء.',
  },
  {
    icon: Zap,
    title: 'موافقة سريعة',
    text: 'مراجعة سريعة لملفك من فريق بشري، وردّ واضح في وقت قصير.',
  },
  {
    icon: CalendarRange,
    title: 'أقساط مرنة',
    text: 'اختر 4 أو 6 أو 12 شهراً — حسب ما يناسب دخلك وراحتك.',
  },
  {
    icon: ShieldCheck,
    title: 'متوافق مع الشريعة',
    text: 'منتج مبني على بيع المرابحة، بسعر متّفق عليه، وبدون ربا.',
  },
]

export function WhyCrido() {
  return (
    <section id="why" className="bg-cream py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="text-sm font-semibold text-teal">لماذا Crido</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight text-ink md:text-[2.6rem]">
            تقسيط واضح وعادل، مصمَّم للجزائر.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 90}>
              <div className="group h-full rounded-3xl border border-line bg-white p-7 transition-all hover:-translate-y-1 hover:border-teal/40">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-surface text-teal transition-colors group-hover:bg-teal group-hover:text-white">
                  <f.icon size={22} strokeWidth={1.75} />
                </span>
                <h3 className="mt-6 text-lg font-bold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
