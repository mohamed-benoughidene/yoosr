"use client"

import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { LandingVideo } from "./VideoPlayer";
import "./landing.css"

export function Hero() {
  const t = useTranslations("landingPage.hero")
  const [subVisible, setSubVisible] = useState(false)

  useEffect(() => {
    const timer1 = setTimeout(() => setSubVisible(true), 600)
    return () => clearTimeout(timer1)
  }, [])


  const sentences = t("headline").split(". ").map((s, i, arr) => {
    const text = i < arr.length - 1 ? (s.endsWith(".") ? s : s + ".") : s;
    return text.split(" ");
  });
  let globalWordIdx = 0;

  return (
    <section className="relative overflow-hidden w-full hero-section" style={{ backgroundColor: "var(--lp-bg)", zIndex: 1 }}>

      {/* Grid background */}
      <div className="hero-grid-bg"></div>
      <div className="hero-noise"></div>

      {/* Ambient background orbs - enhanced glow */}
      <div
        className="absolute rounded-full"
        style={{
          top: "-30%",
          left: "-10%",
          width: "800px",
          height: "800px",
          background: "radial-gradient(circle, var(--lp-gold-alpha-18), transparent 65%)",
          filter: "blur(8px)",
          animation: "driftGold 12s ease-in-out infinite alternate",
          zIndex: -1,
          pointerEvents: "none"
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          top: "-20%",
          right: "-10%",
          width: "700px",
          height: "700px",
          background: "radial-gradient(circle, var(--lp-violet-alpha-15), transparent 65%)",
          filter: "blur(8px)",
          animation: "driftViolet 15s ease-in-out infinite alternate",
          zIndex: -1,
          pointerEvents: "none"
        }}
      />
      {/* Top center gradient glow */}
      <div
        className="absolute rounded-full"
        style={{
          top: "-40%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "1200px",
          height: "600px",
          background: "radial-gradient(ellipse, var(--lp-gold-alpha-12), transparent 70%)",
          filter: "blur(40px)",
          zIndex: -1,
          pointerEvents: "none"
        }}
      />

      <div className="hero-content">
        <div className="hero-badge">Built for MENA · Early Access</div>

        <h1 className="hero-headline">
          {sentences.map((sentence, sIdx) => (
            <span key={sIdx} className="headline-sentence">
              {sentence.map((word, wIdx) => {
                const delay = 200 + (globalWordIdx * 30);
                globalWordIdx++;
                return (
                  <span
                    key={wIdx}
                    className="headline-word inline-block mr-[0.25em]"
                    style={{ animationDelay: `${delay}ms` }}
                  >
                    {word}
                  </span>
                )
              })}
              {sIdx < sentences.length - 1 && <br />}
            </span>
          ))}
        </h1>

        <p className={`hero-subheadline ${subVisible ? 'visible' : ''}`}>
          {t("subheadline")}
        </p>

        <Link
          href="/waitlist"
          style={{
            height: '48px',
            padding: '0 28px',
            background: 'linear-gradient(135deg, var(--lp-gold), var(--lp-violet))',
            color: 'var(--lp-on-primary)',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "var(--font-cabinet-grotesk), sans-serif",
            fontWeight: 600,
            fontSize: '14px',
            transition: '150ms',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            boxShadow: '0 4px 16px var(--lp-gold-alpha-25)',
          }}
          className="hover:opacity-[0.90] hover:scale-[1.02] hover:shadow-[0_8px_24px_var(--lp-gold-alpha-35)]"
        >
          {t("cta")}
        </Link>

        <div className="hero-microcopy">
          {t("ctaMicrocopy")}
        </div>

        <div className="product-showcase-container">
          <div className="product-showcase">
            <LandingVideo
              src="/walkthrough.mp4"
              autoPlay
              showControls={false}
              priority={true}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
