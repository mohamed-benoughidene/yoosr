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
      if (rafId) return; // Skip if a frame is already queued
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
    // Trigger once on mount to handle initial scroll position
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section className="bg-[var(--lp-bg)] py-[64px] md:py-[96px] overflow-hidden" id="how-it-works-section">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Section Header */}
        <ScrollReveal>
          <div className="flex flex-col items-center text-center mb-16 md:mb-24">
            <span className="font-['Inter'] font-[500] text-[11px] text-[var(--lp-gold)] uppercase tracking-[0.1em] mb-4">
              {t("badge")}
            </span>
            <h2 className="font-['Cabinet_Grotesk'] font-[700] text-[36px] md:text-[48px] text-[var(--lp-text)] tracking-tight max-w-[800px] leading-tight">
              {t("headline")}
            </h2>
          </div>
        </ScrollReveal>

        {/* Timeline Container */}
        <div className="relative max-w-[720px] mx-auto" ref={containerRef}>
          
          {/* Master connecting vertical line */}
          {/* It spans from the top of the first step to the bottom of the last step */}
          <div
            className="absolute left-[24px] md:left-[40px] top-0 bottom-0 w-[1px] bg-[var(--lp-border)] origin-top z-0"
            style={{ 
              transform: `scaleY(${lineScale})`,
              // Using a smooth easing for the scale transition to make it feel natural
              transition: "transform 150ms cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          />

          <div className="flex flex-col gap-16 md:gap-24 relative z-10 w-full pt-4 pb-4">
            {steps.map((step, i) => (
              <ScrollReveal key={step.num} delay={i * 100}>
                <div className="relative flex items-start pl-[64px] md:pl-[96px] w-full min-h-[80px]">
                  
                  {/* Active Step Vertical Gold Bar - sits perfectly over the 1px line */}
                  {/* We use -ml-[0.5px] to perfectly center a 2px bar over a 1px border */}
                  <div className="absolute left-[24px] md:left-[40px] top-0 bottom-0 w-[2px] bg-[var(--lp-gold)] -ml-[0.5px] z-10" />

                  {/* Background Numeral */}
                  <div className="absolute left-[64px] md:left-[96px] top-[-36px] md:top-[-44px] font-['Cabinet_Grotesk'] font-[800] text-[56px] md:text-[64px] text-[var(--lp-gold)] opacity-15 pointer-events-none select-none leading-none">
                    {step.num}
                  </div>

                  {/* Step Content */}
                  <div className="relative pt-1 w-full">
                    <h3 className="font-['Cabinet_Grotesk'] font-[700] text-[20px] md:text-[22px] text-[var(--lp-text)] mb-3">
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
        <div className="mt-16 md:mt-24 text-center">
          <ScrollReveal delay={200}>
            <p className="font-['Cabinet_Grotesk'] font-[700] text-[20px] md:text-[24px] text-[var(--lp-gold)]">
              {t("closing")}
            </p>
          </ScrollReveal>
        </div>

      </div>
    </section>
  );
}
