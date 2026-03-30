import React from "react";
import { getTranslations } from "next-intl/server";
import { Shield, Users, MessageSquare } from "lucide-react";

export async function TrustSection() {
  const t = await getTranslations("landingPage.trust");

  return (
    <div className="w-full bg-[var(--lp-surface)] py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 font-inter text-[11px] font-medium uppercase leading-none tracking-[0.1em] text-[var(--lp-gold)]">
            TRUST SIGNALS
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
              <Shield size={24} color="var(--lp-gold)" strokeWidth={1.5} />
            </div>
            <h3 className="mb-2 font-cabinet-grotesk text-[17px] font-semibold tracking-wide text-[var(--lp-text)]">
              {t("builtInPublic.title")}
            </h3>
            <p className="font-inter text-[14px] leading-[22px] text-[var(--lp-text-secondary)] flex-grow">
              {t("builtInPublic.description")}
            </p>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col rounded-[10px] border border-[var(--lp-border)] bg-[var(--lp-surface-2)] p-[28px] transition-all duration-300 hover:border-[var(--lp-gold)] hover:shadow-[0_0_0_1px_var(--lp-gold),0_4px_24px_var(--lp-gold-glow)] h-full">
            <div className="mb-5 flex h-10 w-10 items-center justify-center">
              <Users size={24} color="var(--lp-gold)" strokeWidth={1.5} />
            </div>
            <h3 className="mb-2 font-cabinet-grotesk text-[17px] font-semibold tracking-wide text-[var(--lp-text)]">
              {t("waitlist.title")}
            </h3>
            <p className="font-inter text-[14px] leading-[22px] text-[var(--lp-text-secondary)] flex-grow">
              {t("waitlist.description")}
            </p>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col rounded-[10px] border border-[var(--lp-border)] bg-[var(--lp-surface-2)] p-[28px] transition-all duration-300 hover:border-[var(--lp-gold)] hover:shadow-[0_0_0_1px_var(--lp-gold),0_4px_24px_var(--lp-gold-glow)] h-full">
            <div className="mb-5 flex h-10 w-10 items-center justify-center">
              <MessageSquare size={24} color="var(--lp-gold)" strokeWidth={1.5} />
            </div>
            <h3 className="mb-2 font-cabinet-grotesk text-[17px] font-semibold tracking-wide text-[var(--lp-text)]">
              {t("feedback.title")}
            </h3>
            <p className="font-inter text-[14px] leading-[22px] text-[var(--lp-text-secondary)] flex-grow">
              {t("feedback.description")}
            </p>
          </div>
        </div>

        <div className="mt-12 text-center text-[16px] italic leading-relaxed text-[var(--lp-text-secondary)]">
          {t("closing")}
        </div>
      </div>
    </div>
  );
}
