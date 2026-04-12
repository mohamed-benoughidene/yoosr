import React from "react";
import { getTranslations } from "next-intl/server";
import { Shield, Users, MessageSquare } from "lucide-react";

export async function TrustSection() {
  const t = await getTranslations("landingPage.trust");

  return (
    <div className="w-full py-16 md:py-24 section-glass" style={{ backgroundColor: "var(--lp-bg)" }}>
      <div className="mx-auto max-w-[1200px] px-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          <span className="lp-badge">
            TRUST SIGNALS
          </span>
          <h2 className="lp-headline mt-4">
            {t("headline")}
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] font-inter text-[18px] leading-[28px] text-[var(--lp-text-secondary)]">
            {t("subheadline")}
          </p>
        </div>

        <div className="mx-auto grid max-w-[1020px] gap-6 md:grid-cols-3 mt-12">
          {/* Card 1 */}
          <div className="info-card">
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
          <div className="info-card">
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
          <div className="info-card">
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
