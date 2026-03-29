"use client"

import React, { useState } from "react"
import { ScrollReveal } from "./ScrollReveal"
import { Bot, Monitor, Inbox, BookOpen, Package, BarChart2 } from "lucide-react"

const featuresData = [
  {
    title: "Visual Bot Builder",
    description: "Drag a block, set a condition, go live. No developer, no ticket, no waiting three sprints to automate one question.",
    icon: <Bot size={24} color="var(--lp-gold)" strokeWidth={1.5} />
  },
  {
    title: "Live Monitor",
    description: "Every incoming conversation visible in real time. Filter, assign, and resolve - without ever leaving the screen.",
    icon: <Monitor size={24} color="var(--lp-gold)" strokeWidth={1.5} />
  },
  {
    title: "Unified Inbox",
    description: "Telegram, Instagram, Messenger, and your website widget - one inbox, one team. Your agents stop juggling apps.",
    icon: <Inbox size={24} color="var(--lp-gold)" strokeWidth={1.5} />
  },
  {
    title: "Knowledge Base",
    description: "Add a URL, upload a PDF, or paste plain text. Your bot reads it and answers customer questions - day and night, without asking your team.",
    icon: <BookOpen size={24} color="var(--lp-gold)" strokeWidth={1.5} />
  },
  {
    title: "Order Tracking",
    description: "Create and track orders directly inside the chat window. No separate tool. Your agents capture everything without leaving the conversation.",
    icon: <Package size={24} color="var(--lp-gold)" strokeWidth={1.5} />
  },
  {
    title: "Analytics & CSAT",
    description: "See exactly what your bot resolves, where it gets stuck, and what customers said about every interaction - in one dashboard.",
    icon: <BarChart2 size={24} color="var(--lp-gold)" strokeWidth={1.5} />
  }
]

export function FeaturesGrid() {
  return (
    <section className="relative w-full overflow-hidden py-16 lg:py-24" style={{ backgroundColor: "var(--lp-bg)" }}>
      {/* Background glow band */}
      <div 
        className="absolute w-full h-[600px] pointer-events-none opacity-20"
        style={{ 
          background: "var(--lp-violet-glow)", 
          filter: "blur(200px)",
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
              Built around how support actually works.
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
        transition: "all 150ms ease",
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
