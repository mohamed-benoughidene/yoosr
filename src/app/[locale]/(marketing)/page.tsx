import type { Metadata } from "next"
import { Hero } from "@/components/landing/Hero"
import { FeaturesGrid } from "@/components/landing/FeaturesGrid"

export const metadata: Metadata = {
  title: "Yoosr — Customer Support for MENA Businesses",
  description: "Live chat, bot automation, and team inbox built for MENA businesses. Start for free."
}
import { DesignStudioSection } from "@/components/landing/DesignStudioSection"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { ChannelsSection } from "@/components/landing/ChannelsSection"
import { AnalyticsSection } from "@/components/landing/AnalyticsSection"
import { OrdersSection } from "@/components/landing/OrdersSection"
import { Testimonials } from "@/components/landing/Testimonials"
import { CtaSection } from "@/components/landing/CtaSection"
import { PricingTable } from "@/components/pricing/PricingTable"
import { ScrollReveal } from "@/components/landing/ScrollReveal"
import { setRequestLocale as unstable_setRequestLocale } from "next-intl/server"

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    unstable_setRequestLocale(locale);
  return (
    <>
      <section id="home">
        <Hero />
      </section>

      <section id="logos" className="border-t border-b border-border bg-card py-10">
        <div className="container">
          <p className="text-center text-xs font-mono uppercase tracking-widest
            text-muted-foreground mb-7">
            Powering support teams across the region
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10
            opacity-50 hover:opacity-80 transition-opacity duration-300">
            {["E-commerce","Logistics","Retail","Fintech","Healthcare","SaaS"]
              .map(name => (
                <span
                  key={name}
                  className="text-base font-semibold text-muted-foreground
                    tracking-tight"
                >
                  {name}
                </span>
            ))}
          </div>
        </div>
      </section>

      <ScrollReveal delay={0}>
        <section id="features">
          <FeaturesGrid />
        </section>
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <section id="studio">
          <DesignStudioSection />
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0}>
        <section id="how-it-works">
          <HowItWorks />
        </section>
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <section id="channels">
          <ChannelsSection />
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0}>
        <section id="analytics">
          <AnalyticsSection />
        </section>
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <section id="orders">
          <OrdersSection />
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0}>
        <section id="testimonials">
          <Testimonials />
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0}>
        <section id="pricing">
          <PricingTable />
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0}>
        <CtaSection />
      </ScrollReveal>
    </>
  )
}
