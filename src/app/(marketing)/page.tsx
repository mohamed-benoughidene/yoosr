import { Hero } from "@/components/landing/Hero"
// import { FeaturesGrid } from "@/components/landing/FeaturesGrid"

import { SolutionsSection } from "@/components/landing/SolutionsSection"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { Testimonials } from "@/components/landing/Testimonials"
import { CtaSection } from "@/components/landing/CtaSection"
import { PricingTable } from "@/components/pricing/PricingTable"

export default function Home() {
  return (
    <>
      <section id="home">
        <Hero />
      </section>

      {/* <section id="features">
        <FeaturesGrid />
      </section> */}

      <section id="solutions">
        <SolutionsSection />
      </section>

      <section id="how-it-works">
        <HowItWorks />
      </section>

      <section id="testimonials">
        <Testimonials />
      </section>

      <section id="pricing">
        <PricingTable />
      </section>

      <CtaSection />
    </>
  )
}
