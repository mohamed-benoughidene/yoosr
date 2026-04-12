import { Hero } from "@/components/landing/Hero"
import { SocialProofBar } from "@/components/landing/SocialProofBar"
import { ProblemSection } from "@/components/landing/ProblemSection"
import { ScrollReveal } from "@/components/landing/ScrollReveal"
import dynamic from "next/dynamic"
import Script from "next/script"

const FeaturesGrid = dynamic(() => import("@/components/landing/FeaturesGrid").then(m => ({ default: m.FeaturesGrid })))
const DesignStudioSection = dynamic(() => import("@/components/landing/DesignStudioSection").then(m => ({ default: m.DesignStudioSection })))
const HowItWorks = dynamic(() => import("@/components/landing/HowItWorks").then(m => ({ default: m.HowItWorks })))
const ChannelsSection = dynamic(() => import("@/components/landing/ChannelsSection").then(m => ({ default: m.ChannelsSection })))
const WhoItsFor = dynamic(() => import("@/components/landing/WhoItsFor").then(m => ({ default: m.WhoItsFor })))
const TrustSection = dynamic(() => import("@/components/landing/TrustSection").then(m => ({ default: m.TrustSection })))
const PricingTeaser = dynamic(() => import("@/components/landing/PricingTeaser").then(m => ({ default: m.PricingTeaser })))
const FinalCTA = dynamic(() => import("@/components/landing/FinalCTA").then(m => ({ default: m.FinalCTA })))
import { setRequestLocale as unstable_setRequestLocale } from "next-intl/server"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yoosr.co";

  return {
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        "en": `${baseUrl}/en`,
        "ar": `${baseUrl}/ar`,
        "fr": `${baseUrl}/fr`,
      },
    },
    openGraph: {
      images: [
        {
          url: `${baseUrl}/og/image?title=Yoosr&description=AI-Powered%20Customer%20Support%20Platform`,
          width: 1200,
          height: 630,
          alt: "Yoosr - AI-Powered Customer Support Platform",
        },
      ],
    },
    twitter: {
      images: [`${baseUrl}/og/image?title=Yoosr&description=AI-Powered%20Customer%20Support%20Platform`],
    },
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    unstable_setRequestLocale(locale);
  return (
    <>
      {/* Yoosr Widget - Live Demo */}
      <Script id="yoosr-init" strategy="afterInteractive">
        {`window.yoosrSettings = { projectId: "mx792dt3gv4z3wdh82jwacdzth84qtwg" };`}
      </Script>
      <Script src="https://yoosr.io/widget.js" strategy="afterInteractive" />

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
