"use client";

import { ScrollReveal } from "./ScrollReveal";

export function ProblemSection() {
  const painPoints = [
    "Transferred three times for something the first person should have handled",
    "\"Where's my order?\" - answered manually, all day, every day",
    "No context when the conversation changes hands - the customer has to start over"
  ];

  return (
    <section 
      id="problem" 
      className="relative w-full overflow-hidden py-16 lg:py-24" 
      style={{ backgroundColor: "var(--lp-bg)" }}
    >
      {/* Faint violet glow for the skipped right illustration area */}
      <div 
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none opacity-30"
        style={{ 
          background: "var(--lp-violet-glow)", 
          filter: "blur(120px)",
          top: "50%",
          right: "-100px",
          transform: "translateY(-50%)",
          zIndex: 0
        }} 
      />

      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6">
        <ScrollReveal>
          <div 
            className="font-medium uppercase mb-4"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "11px",
              color: "var(--lp-gold)",
              letterSpacing: "0.1em",
            }}
          >
            THE PROBLEM
          </div>

          <h2 
            className="font-bold text-4xl lg:text-[48px] leading-tight mb-12"
            style={{
              fontFamily: "'Cabinet Grotesk', sans-serif",
              color: "var(--lp-text)",
              maxWidth: "520px",
            }}
          >
            Your customers are tired of repeating themselves. Your team is tired of answering the same questions.
          </h2>
        </ScrollReveal>

        <div className="flex flex-col gap-4 max-w-[520px]">
          {painPoints.map((point, idx) => (
            <ScrollReveal key={idx} delay={idx * 100}>
              <div 
                className="flex items-start gap-3 rounded-[8px] py-4 px-5 border"
                style={{
                  background: "var(--lp-surface)",
                  borderColor: "var(--lp-border)",
                }}
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
            Yoosr fixes the system, not just the symptoms. Smart routing, full context on every handoff, and a bot that handles the repetitive work - so your team only steps in when it actually matters.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
