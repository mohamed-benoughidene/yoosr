import { Hero } from "@/components/landing/Hero"
import { SocialProofBar } from "@/components/landing/SocialProofBar"
import { ProblemSection } from "@/components/landing/ProblemSection"
import { FeaturesGrid } from "@/components/landing/FeaturesGrid"
import { DesignStudioSection } from "@/components/landing/DesignStudioSection"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { ChannelsSection } from "@/components/landing/ChannelsSection"
import { WhoItsFor } from "@/components/landing/WhoItsFor"
import { TrustSection } from "@/components/landing/TrustSection"
import { PricingTeaser } from "@/components/landing/PricingTeaser"
import { FinalCTA } from "@/components/landing/FinalCTA"
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

      <SocialProofBar />

      <ProblemSection />

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
        <section id="who-its-for">
          <WhoItsFor />
        </section>
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <section id="trust-signals">
          <TrustSection />
        </section>
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <section id="pricing">
          <PricingTeaser />
        </section>
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <section id="channels">
          <ChannelsSection />
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0}>
        <section id="waitlist-input-footer">
          <FinalCTA />
        </section>
      </ScrollReveal>
    </>
  )
}
