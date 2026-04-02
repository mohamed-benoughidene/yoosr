"use client"

import React from "react"
import { useTranslations } from "next-intl"
import { ScrollReveal } from "./ScrollReveal"
import { LandingVideo } from "./VideoPlayer"
import "./landing.css"

export function DesignStudioSection() {
  const t = useTranslations("landingPage.designStudio")
  return (
    <section className="w-full relative overflow-hidden" style={{ backgroundColor: "var(--lp-surface)", padding: "96px 0" }}>

      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal>
          <div className="flex flex-col items-center text-center mb-16">
            <div className="ds-label">DESIGN STUDIO</div>
            <h2 className="ds-headline">{t("headline")}</h2>
            <p className="ds-subheadline">
              {t("subheadline")}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 items-stretch gap-6 mb-16">
          <ScrollReveal delay={100} className="h-full">
            <div className="ds-card cursor-pointer group">
              <div className="ds-card-number">01</div>
              <h3 className="ds-card-title">{t("aiFlow.title")}</h3>
              <p className="ds-card-body">
                {t("aiFlow.description")}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200} className="h-full">
            <div className="ds-card cursor-pointer group">
              <div className="ds-card-number">02</div>
              <h3 className="ds-card-title">{t("debugger.title")}</h3>
              <p className="ds-card-body">
                {t("debugger.description")}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300} className="h-full">
            <div className="ds-card cursor-pointer group">
              <div className="ds-card-number">03</div>
              <h3 className="ds-card-title">{t("liveHandoff.title")}</h3>
              <p className="ds-card-body">
                {t("liveHandoff.description")}
              </p>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={400}>
          <div className="w-full rounded-[12px] overflow-hidden border shadow-2xl" style={{ backgroundColor: "var(--lp-surface-2)", borderColor: "var(--lp-border)" }}>
            <LandingVideo 
              src="/design-studio.mp4" 
              autoPlay 
              showControls={true} 
              priority={false}
            />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={500}>
          <div className="ds-closing">
            {t("closing")}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
