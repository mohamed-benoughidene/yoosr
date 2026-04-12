"use client";

import { useTranslations } from "next-intl";
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
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6">
        <ScrollReveal>
          <div
            className="lp-badge"
          >
            THE PROBLEM
          </div>

          <h2
            className="lp-headline mt-4"
          >
            {t("headline")}
          </h2>
        </ScrollReveal>

        <div className="flex flex-col gap-4 max-w-[520px] mt-12">
          {painPoints.map((point, idx) => (
            <ScrollReveal key={`pain-${point.slice(0, 20)}`} delay={idx * 100}>
              <div
                className="pain-point-card flex items-start gap-3"
              >
                <span
                  className="shrink-0 leading-none mt-[2px]"
                  style={{ color: "var(--lp-gold)" }}
                >
                  —
                </span>
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
            className="font-normal text-base italic mt-8 leading-relaxed"
            style={{
              fontFamily: "'Inter', sans-serif",
              color: "var(--lp-text)",
              maxWidth: "480px",
            }}
          >
            {t("transition")}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
