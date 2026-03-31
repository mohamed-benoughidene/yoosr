"use client"

import React, { useState } from "react"
import { ScrollReveal } from "./ScrollReveal"
import { Bot, Monitor, Inbox, BookOpen, Package, BarChart2 } from "lucide-react"
import { useTranslations } from "next-intl"

export function FeaturesGrid() {
  const t = useTranslations("landingPage.features")

  const featuresData = [
    {
      title: t("botBuilder.title"),
      description: t("botBuilder.description"),
      icon: <Bot size={24} color="var(--lp-gold)" strokeWidth={1.5} />
    },
    {
      title: t("liveMonitor.title"),
      description: t("liveMonitor.description"),
      icon: <Monitor size={24} color="var(--lp-gold)" strokeWidth={1.5} />
    },
    {
      title: t("unifiedInbox.title"),
      description: t("unifiedInbox.description"),
      icon: <Inbox size={24} color="var(--lp-gold)" strokeWidth={1.5} />
    },
    {
      title: t("knowledgeBase.title"),
      description: t("knowledgeBase.description"),
      icon: <BookOpen size={24} color="var(--lp-gold)" strokeWidth={1.5} />
    },
    {
      title: t("orderTracking.title"),
      description: t("orderTracking.description"),
      icon: <Package size={24} color="var(--lp-gold)" strokeWidth={1.5} />
    },
    {
      title: t("analytics.title"),
      description: t("analytics.description"),
      icon: <BarChart2 size={24} color="var(--lp-gold)" strokeWidth={1.5} />
    }
  ]
  return (
    <section className="relative w-full overflow-hidden py-16 lg:py-24" style={{ backgroundColor: "var(--lp-bg)" }}>
      {/* Background glow band */}
      <div
        className="absolute w-full h-[600px] pointer-events-none opacity-20"
        style={{
          background: "var(--lp-violet-glow)",
          filter: "blur(8px)",
          top: "50%",
          left: 0,
          transform: "translateY(-50%)",
          zIndex: 0
        }}
      />

      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6">
        <ScrollReveal>
          <div className="flex flex-col items-center text-center mb-16">
            <span 
              className="font-medium uppercase mb-4"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "11px",
                color: "var(--lp-gold)",
                letterSpacing: "0.1em",
              }}
            >
              FEATURES
            </span>
            <h2 
              className="font-bold text-4xl lg:text-[48px] leading-tight"
              style={{
                fontFamily: "'Cabinet Grotesk', sans-serif",
                color: "var(--lp-text)",
              }}
            >
              {t("headline")}
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-2">
          {featuresData.map((feature, idx) => (
            <ScrollReveal key={feature.title} delay={idx * 60}>
              <FeatureCard feature={feature} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ feature }: { feature: any }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex flex-col h-full cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered ? "var(--lp-surface-2)" : "var(--lp-surface)",
        border: `1px solid ${isHovered ? "var(--lp-gold)" : "var(--lp-border)"}`,
        borderRadius: "12px",
        padding: "28px",
        transition: "background 150ms ease, border-color 150ms ease, box-shadow 150ms ease",
        boxShadow: isHovered
          ? "0 0 0 1px var(--lp-gold), 0 4px 24px var(--lp-gold-glow)"
          : "none",
        zIndex: isHovered ? 10 : 1
      }}
    >
      <div>
        {feature.icon}
      </div>
      <h3 
        className="font-semibold"
        style={{
          fontFamily: "'Cabinet Grotesk', sans-serif",
          fontSize: "18px",
          color: "var(--lp-text)",
          marginTop: "16px"
        }}
      >
        {feature.title}
      </h3>
      <p 
        className="font-normal"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "14px",
          color: "var(--lp-text-secondary)",
          marginTop: "8px",
          lineHeight: "22px"
        }}
      >
        {feature.description}
      </p>
    </div>
  )
}
