"use client"

import React from "react"
import { useTranslations } from "next-intl"
import { ScrollReveal } from "./ScrollReveal"

export function DesignStudioSection() {
  const t = useTranslations("landingPage.designStudio")
  return (
    <section className="w-full relative overflow-hidden" style={{ backgroundColor: "var(--lp-surface)", padding: "96px 0" }}>
      <style dangerouslySetInnerHTML={{__html: `
        .ds-label {
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 11px;
          color: var(--lp-gold);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 16px;
        }
        
        .ds-headline {
          font-family: 'Cabinet Grotesk', sans-serif;
          font-weight: 700;
          color: var(--lp-text);
          font-size: 36px;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 24px;
        }
        @media (min-width: 768px) { .ds-headline { font-size: 48px; } }

        .ds-subheadline {
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          font-size: 18px;
          color: var(--lp-text-secondary);
          line-height: 28px;
          max-width: 600px;
          margin: 0 auto;
        }

        .ds-card {
          background-color: var(--lp-surface-2);
          border: 1px solid var(--lp-border);
          border-radius: 10px;
          padding: 24px;
          transition: border-color 150ms ease, box-shadow 150ms ease;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .ds-card:hover {
          border-color: var(--lp-gold);
        }

        .ds-card-number {
          font-family: 'Cabinet Grotesk', sans-serif;
          font-weight: 700;
          font-size: 13px;
          color: var(--lp-gold);
          margin-bottom: 16px;
        }

        .ds-card-title {
          font-family: 'Cabinet Grotesk', sans-serif;
          font-weight: 600;
          font-size: 16px;
          color: var(--lp-text);
          margin-bottom: 8px;
        }

        .ds-card-body {
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          font-size: 14px;
          color: var(--lp-text-secondary);
          line-height: 22px;
        }
        
        .ds-closing {
          font-family: 'Inter', sans-serif;
          font-style: italic;
          font-weight: 400;
          font-size: 16px;
          color: var(--lp-text-secondary);
          text-align: center;
          margin-top: 48px;
        }

        @keyframes drawEdge {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .flow-edge {
          opacity: 0;
          animation: drawEdge 800ms ease-out forwards;
          will-change: opacity;
        }
        .edge-1 { animation-delay: 100ms; }
        .edge-2 { animation-delay: 250ms; }
        .edge-3 { animation-delay: 400ms; }
        .edge-4 { animation-delay: 550ms; }

        @keyframes nodeAppear {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .flow-node {
          opacity: 0;
          animation: nodeAppear 400ms ease-out forwards;
          will-change: opacity, transform;
        }
        .node-1 { animation-delay: 0ms; }
        .node-2 { animation-delay: 150ms; }
        .node-3 { animation-delay: 300ms; }
        .node-4 { animation-delay: 450ms; }
        .node-5 { animation-delay: 600ms; }
      `}} />

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
          <div className="w-full h-[280px] rounded-[12px] relative overflow-hidden border" style={{ backgroundColor: "var(--lp-surface-2)", borderColor: "var(--lp-border)" }}>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 280" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dotGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="rgba(255,255,255,0.03)" />
                </pattern>
                <filter id="nodeGlow">
                  <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <rect width="100%" height="100%" fill="url(#dotGrid)" />

              <g transform="translate(40, 110)">
                {/* Connecting Edges */}
                <path className="flow-edge edge-1" d="M 120 30 C 160 30, 170 30, 210 30" fill="none" stroke="var(--lp-gold)" strokeWidth="1.5" />
                <path className="flow-edge edge-2" d="M 330 30 C 370 30, 380 -20, 420 -20" fill="none" stroke="var(--lp-gold)" strokeWidth="1.5" />
                <path className="flow-edge edge-2" d="M 330 30 C 370 30, 380 80, 420 80" fill="none" stroke="var(--lp-gold)" strokeWidth="1.5" />
                <path className="flow-edge edge-3" d="M 540 -20 C 580 -20, 590 30, 630 30" fill="none" stroke="var(--lp-gold)" strokeWidth="1.5" />
                <path className="flow-edge edge-3" d="M 540 80 C 580 80, 590 30, 630 30" fill="none" stroke="var(--lp-gold)" strokeWidth="1.5" opacity="0.3" />

                {/* Node 1: Start */}
                <g className="flow-node node-1" transform="translate(0, 10)">
                  <rect width="120" height="40" rx="8" fill="var(--lp-surface)" stroke="var(--lp-border)" strokeWidth="1" />
                  <circle cx="20" cy="20" r="4" fill="var(--lp-violet)" />
                  <rect x="34" y="16" width="60" height="4" rx="2" fill="var(--lp-text-muted)" />
                  <rect x="34" y="24" width="40" height="4" rx="2" fill="var(--lp-text-muted)" opacity="0.5" />
                </g>

                {/* Node 2: Condition / Split */}
                <g className="flow-node node-2" transform="translate(210, 0)">
                  <rect width="120" height="60" rx="8" fill="var(--lp-surface)" stroke="var(--lp-border)" strokeWidth="1" />
                  <rect x="20" y="20" width="80" height="4" rx="2" fill="var(--lp-text-muted)" />
                  <rect x="20" y="32" width="60" height="4" rx="2" fill="var(--lp-text-muted)" opacity="0.5" />
                  <circle cx="106" cy="30" r="3" fill="var(--lp-text-muted)" />
                </g>

                {/* Node 3: True Branch */}
                <g className="flow-node node-3" transform="translate(420, -40)">
                  <rect width="120" height="40" rx="8" fill="var(--lp-surface)" stroke="var(--lp-border)" strokeWidth="1" />
                  <rect x="20" y="18" width="80" height="4" rx="2" fill="var(--lp-text-muted)" />
                </g>

                {/* Node 4: False Branch */}
                <g className="flow-node node-4" transform="translate(420, 60)">
                  <rect width="120" height="40" rx="8" fill="var(--lp-surface)" stroke="var(--lp-border)" strokeWidth="1" />
                  <rect x="20" y="18" width="50" height="4" rx="2" fill="var(--lp-text-muted)" opacity="0.5" />
                </g>

                {/* Node 5: The "Active" AI Node */}
                <g className="flow-node node-5" transform="translate(630, 0)">
                  <rect width="130" height="60" rx="8" fill="var(--lp-surface)" stroke="var(--lp-gold)" strokeWidth="1.5" filter="url(#nodeGlow)" />
                  <rect width="130" height="60" rx="8" fill="var(--lp-surface)" stroke="var(--lp-gold)" strokeWidth="1.5" />
                  <path d="M 20 18 L 23 24 L 29 27 L 23 30 L 20 36 L 17 30 L 11 27 L 17 24 Z" fill="var(--lp-gold)" />
                  <rect x="38" y="22" width="70" height="4" rx="2" fill="var(--lp-gold)" opacity="0.9" />
                  <rect x="38" y="32" width="40" height="4" rx="2" fill="var(--lp-gold)" opacity="0.6" />
                </g>
              </g>
            </svg>
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
