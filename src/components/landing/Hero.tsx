"use client"

import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react"

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
      <style dangerouslySetInnerHTML={{__html: `
        .hero-section {
          padding-top: 80px;
          padding-bottom: 64px;
        }
        @media (min-width: 1024px) {
          .hero-section {
            padding-top: 120px;
            padding-bottom: 96px;
          }
        }
        
        .hero-noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
          z-index: 0;
        }

        .hero-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          border-radius: 9999px;
          padding: 6px 16px;
          background: var(--lp-surface);
          border: 1px solid var(--lp-gold);
          color: var(--lp-gold);
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          opacity: 0;
          animation: badgeEnter 400ms ease-out forwards;
        }
        
        @keyframes badgeEnter {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-headline {
          font-family: 'Cabinet Grotesk', sans-serif;
          font-weight: 800;
          color: var(--lp-text);
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin-top: 24px;
          margin-bottom: 24px;
          font-size: 32px;
          max-width: 800px;
        }
        @media (min-width: 640px) { .hero-headline { font-size: 42px; } }
        @media (min-width: 768px) { .hero-headline { font-size: 56px; } }
        @media (min-width: 1024px) { .hero-headline { font-size: 72px; } }

        .headline-sentence {
          white-space: nowrap;
          display: inline-block;
        }

        .headline-word {
          opacity: 0;
          animation: wordFade 400ms ease forwards;
        }
        @keyframes wordFade {
          to { opacity: 1; }
        }

        .hero-subheadline {
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          font-size: 18px;
          color: var(--lp-text-secondary);
          line-height: 28px;
          max-width: 600px;
          margin-bottom: 32px;
          opacity: 0;
          transition: opacity 400ms ease;
        }
        .hero-subheadline.visible { opacity: 1; }

        .hero-form {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 12px;
          width: 100%;
          max-width: 480px;
        }
        @media (min-width: 640px) {
          .hero-form {
            flex-direction: row;
          }
        }

        .waitlist-input {
          height: 48px;
          padding: 0 16px;
          background: var(--lp-surface-2);
          border: 1px solid var(--lp-border);
          color: var(--lp-text);
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          font-size: 15px;
          width: 100%;
          outline: none;
          transition: all 150ms;
        }
        .waitlist-input::placeholder {
          color: var(--lp-text-muted);
        }
        .waitlist-input:focus {
          border-color: var(--lp-gold);
          box-shadow: 0 0 0 3px var(--lp-gold-glow);
        }

        .waitlist-button {
          height: 48px;
          padding: 0 24px;
          background: var(--lp-gold);
          color: #0C0B0F;
          border-radius: 8px;
          font-family: 'Cabinet Grotesk', sans-serif;
          font-weight: 600;
          font-size: 14px;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          transition: transform 100ms, opacity 100ms;
          width: 100%;
        }
        @media (min-width: 640px) {
          .waitlist-button { width: auto; }
        }
        .waitlist-button:hover {
          opacity: 0.88;
          transform: scale(1.02);
        }

        .hero-microcopy {
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          font-size: 13px;
          color: var(--lp-text-muted);
        }
          
        .product-showcase-container {
          position: relative;
          width: 100%;
          max-width: 1000px;
          margin-top: 64px;
          display: flex;
          justify-content: center;
        }
          
        .product-showcase {
          width: 100%;
          border: 1px solid var(--lp-border);
          border-radius: 16px;
          overflow: hidden;
          background: var(--lp-surface);
        }
          
        .product-showcase-placeholder {
          width: 100%;
          aspect-ratio: 16/9;
          background: var(--lp-surface-2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--lp-text-muted);
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          font-size: 14px;
        }
      `}} />

      <div className="hero-noise"></div>

      {/* Ambient background orbs */}
      <div 
        className="absolute rounded-full"
        style={{
          top: "-30%",
          left: "-10%",
          width: "800px",
          height: "800px",
          background: "radial-gradient(circle, rgba(200,169,110,0.25), transparent 65%)",
          filter: "blur(100px)",
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
          background: "radial-gradient(circle, rgba(108,99,255,0.20), transparent 65%)",
          filter: "blur(100px)",
          animation: "driftViolet 15s ease-in-out infinite alternate",
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
        
        <div className="hero-microcopy">
          {t("ctaMicrocopy")}
        </div>
        
        <div className="product-showcase-container">
          <div className="product-showcase">
            <div className="product-showcase-placeholder">
              Product video coming soon
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

