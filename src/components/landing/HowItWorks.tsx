"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "./ScrollReveal";

export function HowItWorks() {
  const t = useTranslations("landingPage.howItWorks");
  const containerRef = useRef<HTMLDivElement>(null);
  const [lineScale, setLineScale] = useState(0);

  const steps = [
    {
      num: "01",
      title: t("step1.title"),
      body: t("step1.description")
    },
    {
      num: "02",
      title: t("step2.title"),
      body: t("step2.description")
    },
    {
      num: "03",
      title: t("step3.title"),
      body: t("step3.description")
    }
  ];

  useEffect(() => {
    let rafId: number;

    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        const start = windowHeight * 0.6;
        const progress = (start - rect.top) / rect.height;

        setLineScale(Math.max(0, Math.min(1, progress)));
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section className="py-16 md:py-24 overflow-hidden section-glass" style={{ backgroundColor: "var(--lp-bg)" }} id="how-it-works-section">
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">

        {/* Section Header */}
        <ScrollReveal>
          <div className="flex flex-col items-center text-center mb-12 md:mb-16">
            <span className="lp-badge">
              {t("badge")}
            </span>
            <h2 className="lp-headline mt-4">
              {t("headline")}
            </h2>
          </div>
        </ScrollReveal>

        {/* Timeline Container */}
        <div className="relative max-w-[720px] mx-auto" ref={containerRef}>

          {/* Master connecting vertical line */}
          <div
            className="absolute left-[24px] md:left-[40px] top-0 bottom-0 w-[1px] bg-[var(--lp-border)] origin-top z-0"
            style={{
              transform: `scaleY(${lineScale})`,
              transition: "transform 150ms cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          />

          <div className="flex flex-col gap-16 md:gap-24 relative z-10 w-full pt-4 pb-4">
            {steps.map((step, i) => (
              <ScrollReveal key={step.num} delay={i * 100}>
                <div className="relative flex items-start pl-[64px] md:pl-[96px] w-full min-h-[80px]">

                  {/* Active Step Vertical Gold Bar */}
                  <div className="absolute left-[24px] md:left-[40px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-[var(--lp-gold)] to-transparent -ml-[0.5px] z-10" />

                  {/* Background Numeral */}
                  <div className="absolute left-[64px] md:left-[96px] top-[-36px] md:top-[-44px] text-[56px] md:text-[64px] text-[var(--lp-gold)] opacity-15 pointer-events-none select-none leading-none" style={{ fontFamily: "var(--font-cabinet-grotesk), sans-serif", fontWeight: 800 }}>
                    {step.num}
                  </div>

                  {/* Step Content - Glass Card */}
                  <div className="relative pt-1 w-full" style={{
                    background: "var(--lp-glass-bg)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid var(--lp-glass-border)",
                    borderRadius: "16px",
                    padding: "24px",
                  }}>
                    <h3 style={{ fontFamily: "var(--font-cabinet-grotesk), sans-serif", fontWeight: 700 }} className="text-[18px] md:text-[20px] text-[var(--lp-text)] mb-3">
                      {step.title}
                    </h3>
                    <p className="font-['Inter'] font-[400] text-[14px] md:text-[15px] text-[var(--lp-text-secondary)] max-w-[520px] leading-[1.6]">
                      {step.body}
                    </p>
                  </div>

                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Closing Line */}
        <div className="mt-12 md:mt-16 text-center">
          <ScrollReveal delay={200}>
            <p style={{ fontFamily: "var(--font-cabinet-grotesk), sans-serif", fontWeight: 700 }} className="text-[20px] md:text-[24px] text-[var(--lp-gold)]">
              {t("closing")}
            </p>
          </ScrollReveal>
        </div>

      </div>
    </section>
  );
}
