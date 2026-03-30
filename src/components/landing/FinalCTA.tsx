"use client"

import React from "react"
import { useTranslations } from "next-intl"

export function FinalCTA() {
  const t = useTranslations("landingPage.finalCta")

  return (
    <section className="relative flex flex-col items-center justify-center py-20 md:py-32 w-full overflow-hidden" style={{ backgroundColor: "var(--lp-bg)" }}>
      {/* Background glow behind text block */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: "600px",
          height: "600px",
          background: "var(--lp-gold-glow)",
          filter: "blur(200px)",
          opacity: 0.25,
          zIndex: 0
        }}
      />

      <div className="relative z-10 w-full max-w-[680px] px-6 text-center mx-auto flex flex-col items-center">
        
        {/* Illustration: Relaxed agent blob */}
        <div className="mb-10 w-full flex justify-center items-center h-[160px] relative">
          {/* Label floating */}
          <div 
            className="absolute top-0 px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center justify-center gap-1.5 z-10 animate-bounce"
            style={{
              backgroundColor: "var(--lp-surface-2)",
              borderColor: "var(--lp-gold)",
              borderWidth: "1px",
              color: "var(--lp-gold)",
              boxShadow: "0 4px 12px var(--lp-gold-glow)"
            }}
          >
            Queue: 0
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          {/* Abstract SVG Illustration */}
          <div className="mt-12 relative w-[200px] h-[100px]">
            {/* Desk Line */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140px] h-[3px] rounded-full" style={{ backgroundColor: "var(--lp-border)" }}></div>
            
            {/* Relaxed Blob */}
            <svg className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-[80px] h-[70px]" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 70C10 40 25 10 40 10C55 10 70 40 70 70" stroke="var(--lp-gold)" strokeWidth="3" fill="var(--lp-surface)" />
              {/* Headset Arc resting */}
              <path d="M20 30C20 15 60 15 60 30" stroke="var(--lp-gold)" strokeWidth="3" strokeLinecap="round" />
            </svg>
            
            {/* Feet up (abstract lines crossed) */}
            <svg className="absolute bottom-[10px] right-[10px] w-[30px] h-[30px]" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="5" y1="25" x2="25" y2="5" stroke="var(--lp-gold)" strokeWidth="3" strokeLinecap="round" />
              <line x1="10" y1="30" x2="25" y2="15" stroke="var(--lp-gold)" strokeWidth="3" strokeLinecap="round" />
            </svg>

            {/* Coffee cup on desk */}
            <svg className="absolute bottom-[3px] left-[30px] w-[18px] h-[24px]" viewBox="0 0 18 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="8" width="14" height="16" rx="3" fill="var(--lp-violet)" />
              <path d="M16 12H18C19.1046 12 20 12.8954 20 14V16C20 17.1046 19.1046 18 18 18H16" stroke="var(--lp-violet)" strokeWidth="2" strokeLinecap="round" />
              {/* Steam waves */}
              <path d="M6 5C6 3 8 4 8 2" stroke="var(--lp-text-muted)" strokeWidth="1.5" strokeLinecap="round" className="animate-pulse" />
              <path d="M11 6C11 4 13 4 13 1" stroke="var(--lp-text-muted)" strokeWidth="1.5" strokeLinecap="round" className="animate-pulse" style={{ animationDelay: '200ms' }} />
            </svg>
          </div>
        </div>

        <h2 
          className="mb-6 font-extrabold text-[40px] md:text-[56px]"
          style={{ 
            fontFamily: "'Cabinet Grotesk', sans-serif",
            lineHeight: 1.1,
            color: "var(--lp-text)",
            letterSpacing: "-0.03em"
          }}
        >
          {t("headline")}
        </h2>
        
        <p 
          className="mb-10 text-[18px] max-w-[520px] mx-auto"
          style={{
            fontFamily: "'Inter', sans-serif",
            color: "var(--lp-text-secondary)",
            lineHeight: "28px",
            fontWeight: 400
          }}
        >
          {t("subheadline")}
        </p>

        <button 
          onClick={() => window.location.href = '/waitlist'}
          style={{
            height: '48px',
            padding: '0 24px',
            background: 'var(--lp-gold)',
            color: '#0C0B0F',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Cabinet Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '14px',
            transition: '100ms'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.88'
            e.currentTarget.style.transform = 'scale(1.02)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          {t("cta")}
        </button>

        <div className="flex flex-col gap-1.5 mt-2">
          <p 
            className="text-[13px]"
            style={{
              fontFamily: "'Inter', sans-serif",
              color: "var(--lp-text-muted)",
              fontWeight: 400
            }}
          >
            {t("ctaMicrocopy")}
          </p>
          <p 
            className="text-[14px]"
            style={{
              fontFamily: "'Inter', sans-serif",
              color: "var(--lp-text-muted)",
              fontWeight: 400
            }}
          >
            {t("secondary")}
          </p>
        </div>

      </div>
    </section>
  )
}
