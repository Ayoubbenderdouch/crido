import { ArrowLeft } from 'lucide-react'
import { Reveal } from './Reveal'

export function MerchantBand() {
  return (
    <section id="merchants" className="bg-cream pb-8 pt-4 md:pb-16">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[32px] bg-teal-deep px-8 py-12 md:px-14 md:py-16">
            <div className="glow-pulse pointer-events-none absolute -top-24 -end-16 h-80 w-80 rounded-full bg-teal-bright/25 blur-[110px]" />
            <div className="relative grid gap-8 md:grid-cols-[1.5fr_1fr] md:items-center">
              <div>
                <p className="text-sm font-semibold text-amber">للتجار</p>
                <h2 className="mt-3 text-3xl font-bold leading-tight text-white md:text-[2.4rem]">
                  بِع أكثر، دون أن تتحمّل أي مخاطرة.
                </h2>
                <p className="mt-4 max-w-md text-lg leading-relaxed text-teal-surface/75">
                  عميلك يحصل على التقسيط، وأنت تستلم ثمن البيع كاملاً ومقدّماً من
                  Crido. لا انتظار، ولا متابعة أقساط.
                </p>
              </div>
              <div className="flex md:justify-end">
                <a
                  href="#download"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-teal transition-transform hover:scale-[1.03]"
                >
                  انضمّ كتاجر شريك
                  <ArrowLeft size={17} />
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
