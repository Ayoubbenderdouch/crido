import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Reveal } from './Reveal'

const ITEMS = [
  {
    q: 'هل توجد فوائد على التقسيط؟',
    a: 'لا. تعمل Crido بنظام المرابحة — هامش ثابت ومعروف لك مُسبقاً، بدون أي فوائد، وبدون غرامات تأخير.',
  },
  {
    q: 'من أي متجر أستطيع الشراء؟',
    a: 'من أي متجر في أدرار. إن كان شريكاً معنا تجده في التطبيق مباشرةً، وإن لم يكن نتحقق منه هاتفياً ثم نكمل تمويلك.',
  },
  {
    q: 'ما المدد المتاحة للتقسيط؟',
    a: 'يمكنك الاختيار بين 4 أو 6 أو 12 شهراً، بأقساط شهرية ثابتة ومتساوية.',
  },
  {
    q: 'ما المستندات التي أحتاجها؟',
    a: 'بطاقة التعريف الوطنية، صورة شخصية، ومعلومات عملك وحسابك البريدي (CCP) أو البنكي. كل ذلك من داخل التطبيق.',
  },
  {
    q: 'هل Crido متوفّرة خارج أدرار؟',
    a: 'نبدأ من ولاية أدرار، ونخطّط للتوسّع تدريجياً إلى ولايات أخرى. سجّل في التطبيق لنُعلِمك عند وصولنا إليك.',
  },
]

export function Faq() {
  const [open, setOpen] = useState(0)

  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal>
          <p className="text-center text-sm font-semibold text-teal">الأسئلة الشائعة</p>
          <h2 className="mt-3 text-center text-3xl font-bold leading-tight text-ink md:text-[2.6rem]">
            كل ما تريد معرفته.
          </h2>
        </Reveal>

        <div className="mt-12 space-y-3">
          {ITEMS.map((item, i) => {
            const isOpen = open === i
            return (
              <Reveal key={item.q} delay={i * 60}>
                <div
                  className={`rounded-2xl border bg-cream transition-colors ${
                    isOpen ? 'border-teal/40' : 'border-line'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start"
                  >
                    <span className="font-semibold text-ink">{item.q}</span>
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-teal transition-transform duration-300 ${
                        isOpen ? 'rotate-45 bg-teal text-white' : 'bg-teal-surface'
                      }`}
                    >
                      <Plus size={16} strokeWidth={2.5} />
                    </span>
                  </button>
                  <div
                    className="grid transition-all duration-300"
                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-5 text-sm leading-relaxed text-ink-soft">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
