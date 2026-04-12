"use client"

import React from "react"
import { useTranslations } from "next-intl"
import { ScrollReveal } from "./ScrollReveal"
import { LandingVideo } from "./VideoPlayer"
import "./landing.css"

export function DesignStudioSection() {
  const t = useTranslations("landingPage.designStudio")
  return (
    <section className="w-full relative overflow-hidden py-16 md:py-24 section-glass" style={{ backgroundColor: "var(--lp-bg-deep)" }}>
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <ScrollReveal>
          <div className="flex flex-col items-center text-center mb-12">
            <div className="lp-badge">{t("badge")}</div>
            <h2 className="lp-headline mt-4">{t("headline")}</h2>
            <p className="lp-subheadline mt-4">
              {t("subheadline")}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 items-stretch gap-6 mb-12">
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
          <div className="w-full rounded-[20px] overflow-hidden" style={{
            background: "var(--lp-surface)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid var(--lp-glass-border)",
            boxShadow: "0 24px 64px var(--lp-black-alpha-40), inset 0 1px 0 var(--lp-white-alpha-05)"
          }}>
            <LandingVideo
              src="/design-studio.mp4"
              autoPlay
              showControls={true}
              priority={false}
            />
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
