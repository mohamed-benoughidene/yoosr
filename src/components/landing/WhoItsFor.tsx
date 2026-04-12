"use client"

import React from "react"
import { ShoppingBag, Monitor, Users } from "lucide-react"
import { useTranslations } from "next-intl"

const EcomIcon = () => (
  <ShoppingBag size={24} color="var(--lp-gold)" strokeWidth={1.5} className="mb-6" />
)

const SaasIcon = () => (
  <Monitor size={24} color="var(--lp-gold)" strokeWidth={1.5} className="mb-6" />
)

const AgencyIcon = () => (
  <Users size={24} color="var(--lp-gold)" strokeWidth={1.5} className="mb-6" />
)

export function WhoItsFor() {
  const t = useTranslations("landingPage.audience")
  return (
    <div className="w-full py-16 md:py-24 px-6 relative overflow-hidden section-glass" style={{ backgroundColor: "var(--lp-bg-deep)" }}>
      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="flex flex-col items-center justify-center text-center">
          <span className="lp-badge">
            WHO IT&apos;S FOR
          </span>
          <h2 className="lp-headline mt-4">
            {t("headline")}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12 pb-8">
          {/* E-commerce Card (Highlighted by default on desktop) */}
          <div className="audience-card-primary h-full flex flex-col">
            <EcomIcon />
            <h3 className="font-cabinet font-bold text-xl text-[var(--lp-text)]">
              {t("ecommerce.title")}
            </h3>
            <p className="mt-2 text-sm text-[var(--lp-text-secondary)] leading-[22px] font-inter flex-grow">
              {t("ecommerce.description")}
            </p>
          </div>

          {/* SaaS Card */}
          <div className="audience-card h-full flex flex-col">
            <SaasIcon />
            <h3 className="font-cabinet font-bold text-xl text-[var(--lp-text)]">
              {t("saas.title")}
            </h3>
            <p className="mt-2 text-sm text-[var(--lp-text-secondary)] leading-[22px] font-inter flex-grow">
              {t("saas.description")}
            </p>
          </div>

          {/* Agencies Card */}
          <div className="audience-card h-full flex flex-col">
            <AgencyIcon />
            <h3 className="font-cabinet font-bold text-xl text-[var(--lp-text)]">
              {t("agencies.title")}
            </h3>
            <p className="mt-2 text-sm text-[var(--lp-text-secondary)] leading-[22px] font-inter flex-grow">
              {t("agencies.description")}
            </p>
          </div>
        </div>

        <div className="mt-6 md:mt-8 text-center">
          <p className="text-base text-[var(--lp-text-secondary)] italic font-inter max-w-2xl mx-auto">
            {t("closing")}
          </p>
        </div>
      </div>
    </div>
  )
}
