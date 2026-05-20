import { Nav } from '@/components/Nav'
import { Hero } from '@/components/Hero'
import { HowItWorks } from '@/components/HowItWorks'
import { TwoPaths } from '@/components/TwoPaths'
import { WhyCrido } from '@/components/WhyCrido'
import { Plans } from '@/components/Plans'
import { MerchantBand } from '@/components/MerchantBand'
import { Faq } from '@/components/Faq'
import { Footer } from '@/components/Footer'

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <TwoPaths />
        <WhyCrido />
        <Plans />
        <MerchantBand />
        <Faq />
      </main>
      <Footer />
    </>
  )
}
