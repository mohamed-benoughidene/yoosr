"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { ScrollReveal } from "./ScrollReveal";

export function ProblemSection() {
  const t = useTranslations("landingPage.problem");

  const painPoints = [
    t("painPoint1"),
    t("painPoint2"),
    t("painPoint3")
  ];

  return (
    <section
      id="problem"
      className="relative w-full overflow-hidden py-16 lg:py-24 section-glass"
      style={{ backgroundColor: "var(--lp-bg)" }}
    >
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-0 mt-12 rounded-2xl overflow-hidden">
          {/* Left column — cards + text on SVG-matched background */}
          <div
            className="flex-1 p-8 md:p-12 flex flex-col justify-center"
            style={{
              background: "var(--lp-bg-deep)",
            }}
          >
            <ScrollReveal>
              <div className="lp-badge" style={{ color: "var(--lp-gold)" }}>
                {t("badge")}
              </div>

              <h2
                className="lp-headline mt-4"
                style={{ color: "var(--lp-text)" }}
              >
                {t("headline")}
              </h2>
            </ScrollReveal>

            <div className="flex flex-col gap-4 mt-8">
              {painPoints.map((point, idx) => (
                <ScrollReveal key={`pain-${point.slice(0, 20)}`} delay={idx * 100}>
                  <div
                    className="rounded-xl px-5 py-3"
                    style={{
                      background: "var(--lp-surface)",
                      border: "1px solid var(--lp-border)",
                    }}
                  >
                    <p
                      className="font-normal text-[15px] leading-snug"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        color: "var(--lp-text-secondary)",
                      }}
                    >
                      {point}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={300}>
              <p
                className="font-normal text-base italic mt-6 leading-relaxed"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: "var(--lp-text-muted)",
                }}
              >
                {t("transition")}
              </p>
            </ScrollReveal>
          </div>

          <div className="flex-1 relative min-h-[300px] md:min-h-[400px]">
            <Image
              src="/Problem.svg"
              alt="Customer overwhelmed by chaotic support"
              fill
              className="object-cover"
              style={{ opacity: 0.8 }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
