"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function PricingTeaser() {
  const t = useTranslations("landingPage.pricing");
  const router = useRouter();

  const scrollToWaitlist = () => {
    router.push('/waitlist');
  };

  return (
    <div className="w-full bg-[var(--lp-bg)] py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 font-inter text-[11px] font-medium uppercase leading-none tracking-[0.1em] text-[var(--lp-gold)]">
            PRICING
          </span>
          <h2 className="mb-4 font-cabinet-grotesk text-4xl font-bold leading-tight tracking-tight text-[var(--lp-text)] md:text-[48px] md:leading-[56px]">
            {t("headline")}
          </h2>
          <p className="mx-auto mb-16 max-w-[520px] font-inter text-[18px] leading-[28px] text-[var(--lp-text-secondary)]">
            {t("subheadline")}
          </p>
        </div>

        <div className="mx-auto grid max-w-[1020px] gap-6 md:grid-cols-3">
          {/* Card 1 */}
          <div className="flex flex-col rounded-[10px] border border-[var(--lp-border)] bg-[var(--lp-surface-2)] p-[28px] transition-all duration-300 hover:border-[var(--lp-gold)] hover:shadow-[0_0_0_1px_var(--lp-gold),0_4px_24px_var(--lp-gold-glow)] h-full">
            <div className="mb-5 flex h-10 w-10 items-center justify-center">
              {/* Ticket / Free Tag Icon */}
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--lp-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
              </svg>
            </div>
            <h3 className="mb-2 font-cabinet-grotesk text-[17px] font-semibold tracking-wide text-[var(--lp-text)]">
              {t("free.title")}
            </h3>
            <p className="font-inter text-[14px] leading-[22px] text-[var(--lp-text-secondary)] flex-grow">
              {t("free.description")}
            </p>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col rounded-[10px] border border-[var(--lp-border)] bg-[var(--lp-surface-2)] p-[28px] transition-all duration-300 hover:border-[var(--lp-gold)] hover:shadow-[0_0_0_1px_var(--lp-gold),0_4px_24px_var(--lp-gold-glow)] h-full">
            <div className="mb-5 flex h-10 w-10 items-center justify-center">
              {/* Lock Icon */}
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--lp-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 className="mb-2 font-cabinet-grotesk text-[17px] font-semibold tracking-wide text-[var(--lp-text)]">
              {t("founderPricing.title")}
            </h3>
            <p className="font-inter text-[14px] leading-[22px] text-[var(--lp-text-secondary)] flex-grow">
              {t("founderPricing.description")}
            </p>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col rounded-[10px] border border-[var(--lp-border)] bg-[var(--lp-surface-2)] p-[28px] transition-all duration-300 hover:border-[var(--lp-gold)] hover:shadow-[0_0_0_1px_var(--lp-gold),0_4px_24px_var(--lp-gold-glow)] h-full">
            <div className="mb-5 flex h-10 w-10 items-center justify-center">
              {/* Sparkle Icon */}
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--lp-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
              </svg>
            </div>
            <h3 className="mb-2 font-cabinet-grotesk text-[17px] font-semibold tracking-wide text-[var(--lp-text)]">
              {t("noSurprises.title")}
            </h3>
            <p className="font-inter text-[14px] leading-[22px] text-[var(--lp-text-secondary)] flex-grow">
              {t("noSurprises.description")}
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center">
          <button
            onClick={scrollToWaitlist}
            className="flex h-[52px] w-full max-w-[320px] items-center justify-center rounded-lg bg-[var(--lp-gold)] font-cabinet-grotesk text-[16px] font-semibold text-[#0C0B0F] transition-all duration-150 hover:scale-[1.02] hover:opacity-90"
          >
            {t("cta")}
          </button>
          <span className="mt-4 font-inter text-[13px] text-[var(--lp-text-muted)]">
            {t("ctaMicrocopy")}
          </span>
        </div>
      </div>
    </div>
  );
}
