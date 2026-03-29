import React from "react";
import { Shield, Users, MessageSquare } from "lucide-react";

export function TrustSection() {
  return (
    <div className="w-full bg-[var(--lp-surface)] py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 font-inter text-[11px] font-medium uppercase leading-none tracking-[0.1em] text-[var(--lp-gold)]">
            TRUST SIGNALS
          </span>
          <h2 className="mb-4 font-cabinet-grotesk text-4xl font-bold leading-tight tracking-tight text-[var(--lp-text)] md:text-[48px] md:leading-[56px]">
            Early access. Real product. No vaporware.
          </h2>
          <p className="mx-auto mb-16 max-w-[520px] font-inter text-[18px] leading-[28px] text-[var(--lp-text-secondary)]">
            Yoosr is live, tested, and being used by early teams right now. We're not selling a roadmap - everything on this page exists and works today.
          </p>
        </div>

        <div className="mx-auto grid max-w-[1020px] gap-6 md:grid-cols-3">
          {/* Card 1 */}
          <div className="flex flex-col rounded-[10px] border border-[var(--lp-border)] bg-[var(--lp-surface-2)] p-[28px] transition-all duration-300 hover:border-[var(--lp-gold)] hover:shadow-[0_0_0_1px_var(--lp-gold),0_4px_24px_var(--lp-gold-glow)] h-full">
            <div className="mb-5 flex h-10 w-10 items-center justify-center">
              <Shield size={24} color="var(--lp-gold)" strokeWidth={1.5} />
            </div>
            <h3 className="mb-2 font-cabinet-grotesk text-[17px] font-semibold tracking-wide text-[var(--lp-text)]">
              Built in public
            </h3>
            <p className="font-inter text-[14px] leading-[22px] text-[var(--lp-text-secondary)] flex-grow">
              The codebase is real, the features are shipped, and the product is actively being tested. No slides. No demos of things that don't exist yet.
            </p>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col rounded-[10px] border border-[var(--lp-border)] bg-[var(--lp-surface-2)] p-[28px] transition-all duration-300 hover:border-[var(--lp-gold)] hover:shadow-[0_0_0_1px_var(--lp-gold),0_4px_24px_var(--lp-gold-glow)] h-full">
            <div className="mb-5 flex h-10 w-10 items-center justify-center">
              <Users size={24} color="var(--lp-gold)" strokeWidth={1.5} />
            </div>
            <h3 className="mb-2 font-cabinet-grotesk text-[17px] font-semibold tracking-wide text-[var(--lp-text)]">
              50+ teams on the waitlist
            </h3>
            <p className="font-inter text-[14px] leading-[22px] text-[var(--lp-text-secondary)] flex-grow">
              Founders, e-commerce operators, and agency owners across the region are already signed up. Early access spots are limited.
            </p>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col rounded-[10px] border border-[var(--lp-border)] bg-[var(--lp-surface-2)] p-[28px] transition-all duration-300 hover:border-[var(--lp-gold)] hover:shadow-[0_0_0_1px_var(--lp-gold),0_4px_24px_var(--lp-gold-glow)] h-full">
            <div className="mb-5 flex h-10 w-10 items-center justify-center">
              <MessageSquare size={24} color="var(--lp-gold)" strokeWidth={1.5} />
            </div>
            <h3 className="mb-2 font-cabinet-grotesk text-[17px] font-semibold tracking-wide text-[var(--lp-text)]">
              Your feedback shapes the product
            </h3>
            <p className="font-inter text-[14px] leading-[22px] text-[var(--lp-text-secondary)] flex-grow">
              Early access users get direct access to the founding team. What you need gets built. What doesn't work gets fixed.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center text-[16px] italic leading-relaxed text-[var(--lp-text-secondary)]">
          We'll let the product speak for itself. Get in and see.
        </div>
      </div>
    </div>
  );
}
