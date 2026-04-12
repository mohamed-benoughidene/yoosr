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
    <section className="relative w-full overflow-hidden py-16 lg:py-24 section-glass" style={{ backgroundColor: "var(--lp-bg)" }}>
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6">
        <ScrollReveal>
          <div className="flex flex-col items-center text-center mb-12">
            <span className="lp-badge">
              FEATURES
            </span>
            <h2
              className="lp-headline mt-4 mb-0"
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

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  [key: string]: unknown;
}

function FeatureCard({ feature }: { feature: Feature }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex flex-col h-full cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered ? "var(--lp-surface-hover)" : "var(--lp-glass-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${isHovered ? "var(--lp-gold)" : "var(--lp-glass-border)"}`,
        borderRadius: "16px",
        padding: "28px",
        transition: "all 200ms ease",
        boxShadow: isHovered
          ? "0 8px 32px var(--lp-black-alpha-30), 0 0 0 1px var(--lp-gold), 0 0 24px var(--lp-gold-glow)"
          : "0 4px 16px var(--lp-black-alpha-10)",
        zIndex: isHovered ? 10 : 1
      }}
    >
      <div>
        {feature.icon}
      </div>
      <h3
        className="font-semibold"
        style={{
          fontFamily: "var(--font-cabinet-grotesk), sans-serif",
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
