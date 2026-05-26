import { Nav } from '@/components/Nav'
import { ScrollProgress } from '@/components/ScrollProgress'
import { Hero } from '@/components/Hero'
import { TrustStrip } from '@/components/TrustStrip'
import { FinancingCalculator } from '@/components/FinancingCalculator'
import { AppShowcase } from '@/components/AppShowcase'
import { HowItWorks } from '@/components/HowItWorks'
import { Categories } from '@/components/Categories'
import { TwoPaths } from '@/components/TwoPaths'
import { WhyCrido } from '@/components/WhyCrido'
import { Plans } from '@/components/Plans'
import { MerchantBand } from '@/components/MerchantBand'
import { AdrarSection } from '@/components/AdrarSection'
import { Faq } from '@/components/Faq'
import { Footer } from '@/components/Footer'
import { StickyDownloadBanner } from '@/components/StickyDownloadBanner'

export default function App() {
  return (
    <>
      <ScrollProgress />
      <Nav />
      <main>
        <Hero />
        <TrustStrip />
        <FinancingCalculator />
        <AppShowcase />
        <HowItWorks />
        <Categories />
        <TwoPaths />
        <WhyCrido />
        <Plans />
        <MerchantBand />
        <AdrarSection />
        <Faq />
      </main>
      <Footer />
      <StickyDownloadBanner />
    </>
  )
}
