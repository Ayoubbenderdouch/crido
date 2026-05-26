import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useT } from '@/i18n/useT'
import { Reveal } from './Reveal'

const TR = {
  ar: {
    eyebrow: 'الأسئلة الشائعة',
    heading: 'كل ما تريد معرفته.',
    q1: 'هل توجد فوائد على التقسيط؟',
    a1: 'لا. تعمل Crido بنظام المرابحة — هامش ثابت ومعروف لك مُسبقاً، بدون أي فوائد، وبدون غرامات تأخير.',
    q2: 'من أي متجر أستطيع الشراء؟',
    a2: 'من أي متجر في أدرار. إن كان شريكاً معنا تجده في التطبيق مباشرةً، وإن لم يكن نتحقق منه هاتفياً ثم نكمل تمويلك.',
    q3: 'ما المدد المتاحة للتقسيط؟',
    a3: 'يمكنك الاختيار بين 4 أو 6 أو 12 شهراً، بأقساط شهرية ثابتة ومتساوية.',
    q4: 'ما المستندات التي أحتاجها؟',
    a4: 'بطاقة التعريف الوطنية، صورة شخصية، ومعلومات عملك وحسابك البريدي (CCP) أو البنكي. كل ذلك من داخل التطبيق.',
    q5: 'هل Crido متوفّرة خارج أدرار؟',
    a5: 'نبدأ من ولاية أدرار، ونخطّط للتوسّع تدريجياً إلى ولايات أخرى. سجّل في التطبيق لنُعلِمك عند وصولنا إليك.',
  },
  fr: {
    eyebrow: 'Questions fréquentes',
    heading: 'Tout ce que vous devez savoir.',
    q1: 'Y a-t-il des intérêts sur le paiement échelonné ?',
    a1: "Non. Crido fonctionne selon le modèle Mourabaha — une marge fixe connue à l'avance, sans aucun intérêt et sans pénalités de retard.",
    q2: 'Dans quels magasins puis-je acheter ?',
    a2: "Dans n'importe quel magasin à Adrar. S'il est partenaire, vous le trouvez directement dans l'app ; sinon, nous le vérifions par téléphone puis nous finalisons votre financement.",
    q3: 'Quelles sont les durées de paiement disponibles ?',
    a3: 'Vous pouvez choisir entre 4, 6 ou 12 mois, avec des mensualités fixes et égales.',
    q4: "Quels documents dois-je fournir ?",
    a4: "La carte nationale d'identité, une photo personnelle, ainsi que les informations sur votre activité et votre compte CCP ou bancaire. Le tout depuis l'application.",
    q5: "Crido est-elle disponible en dehors d'Adrar ?",
    a5: "Nous démarrons dans la Wilaya d'Adrar et prévoyons une expansion progressive vers d'autres Wilayas. Inscrivez-vous dans l'app pour être notifié(e) dès notre arrivée chez vous.",
  },
} as const

const ITEMS = [
  { q: 'q1', a: 'a1' },
  { q: 'q2', a: 'a2' },
  { q: 'q3', a: 'a3' },
  { q: 'q4', a: 'a4' },
  { q: 'q5', a: 'a5' },
] as const

export function Faq() {
  const t = useT(TR)
  const [open, setOpen] = useState(0)

  return (
    <section className="bg-white py-16 sm:py-20 md:py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        <Reveal>
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-teal sm:text-sm">
            {t('eyebrow')}
          </p>
          <h2 className="mt-3 text-center text-2xl font-bold leading-tight text-ink sm:text-3xl md:text-[2.6rem]">
            {t('heading')}
          </h2>
        </Reveal>

        <div className="mt-8 space-y-2.5 sm:mt-10 sm:space-y-3 md:mt-12">
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
                    aria-expanded={isOpen}
                    className="flex w-full min-h-[60px] items-center justify-between gap-3 px-5 py-4 text-start sm:gap-4 sm:px-6 sm:py-5"
                  >
                    <span className="text-base font-semibold leading-snug text-ink md:text-lg">
                      {t(item.q)}
                    </span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-teal transition-transform duration-300 sm:h-7 sm:w-7 ${
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
                      <p className="px-5 pb-5 text-sm leading-relaxed text-ink-soft sm:px-6">
                        {t(item.a)}
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
