import { Hero } from "@/components/landing/Hero"
import { FeaturesGrid } from "@/components/landing/FeaturesGrid"
import { DesignStudioSection } from "@/components/landing/DesignStudioSection"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { ChannelsSection } from "@/components/landing/ChannelsSection"
import { AnalyticsSection } from "@/components/landing/AnalyticsSection"
import { OrdersSection } from "@/components/landing/OrdersSection"
import { Testimonials } from "@/components/landing/Testimonials"
import { CtaSection } from "@/components/landing/CtaSection"
import { PricingTable } from "@/components/pricing/PricingTable"
import { ScrollReveal } from "@/components/landing/ScrollReveal"
import { setRequestLocale as unstable_setRequestLocale, getTranslations } from "next-intl/server"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing.meta" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    unstable_setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: "landing" });
  return (
    <>
      <section id="home">
        <Hero />
      </section>

      <section id="logos" className="border-t border-b border-border bg-card py-10">
        <div className="container">
          <p className="text-center text-xs font-mono uppercase tracking-widest
            text-muted-foreground mb-7">
            {t("page.tagline")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10
            opacity-50 hover:opacity-80 transition-opacity duration-300">
            {(t.raw("page.industries") as string[])
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
        <section id="pricing" className="relative overflow-hidden">
          <div className="absolute inset-0 z-10 bg-background/10 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
            <div className="bg-background/80 backdrop-blur-md border border-border shadow-2xl px-6 py-3 rounded-full flex items-center gap-3 animate-in fade-in zoom-in duration-1000">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-20"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <span className="text-sm font-semibold tracking-tight uppercase">Early Access — Plans Coming Soon</span>
            </div>
          </div>
          <div className="grayscale-[0.8] opacity-30 pointer-events-none">
            <PricingTable />
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0}>
        <CtaSection />
      </ScrollReveal>
    </>
  )
}
