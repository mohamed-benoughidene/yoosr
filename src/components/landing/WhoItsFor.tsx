"use client"

import React from "react"
import { ShoppingBag, Monitor, Users } from "lucide-react"

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
  return (
    <div className="w-full bg-[var(--lp-bg)] py-16 md:py-24 px-6 relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-medium tracking-[0.1em] uppercase text-[var(--lp-gold)] mb-4 font-inter">
            WHO IT&apos;S FOR
          </span>
          <h2 className="font-cabinet font-bold text-4xl md:text-5xl text-[var(--lp-text)] max-w-2xl leading-tight">
            Built for teams that can&apos;t afford to miss a message.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-16 pb-8">
          {/* E-commerce Card (Highlighted by default on desktop) */}
          <div className="h-full flex flex-col p-8 rounded-[12px] bg-[var(--lp-surface)] border border-[var(--lp-gold)] shadow-[0_0_24px_var(--lp-gold-glow)] transition-all duration-300 lg:border-[var(--lp-gold)] lg:shadow-[0_0_24px_var(--lp-gold-glow)]">
            <EcomIcon />
            <h3 className="font-cabinet font-bold text-xl text-[var(--lp-text)]">
              E-commerce Stores
            </h3>
            <p className="mt-2 text-sm text-[var(--lp-text-secondary)] leading-[22px] font-inter">
              Your customers ask the same questions before every purchase - shipping times, return policies, order status. Your bot answers all of it automatically, around the clock. Your team steps in only when a human touch actually matters.
            </p>
          </div>

          {/* SaaS Card */}
          <div className="h-full flex flex-col p-8 rounded-[12px] bg-[var(--lp-surface)] border border-[var(--lp-border)] transition-all duration-300 hover:border-[var(--lp-gold)] hover:shadow-[0_0_24px_var(--lp-gold-glow)]">
            <SaasIcon />
            <h3 className="font-cabinet font-bold text-xl text-[var(--lp-text)]">
              SaaS Companies
            </h3>
            <p className="mt-2 text-sm text-[var(--lp-text-secondary)] leading-[22px] font-inter">
              Turn support conversations into growth conversations. Qualify leads, onboard new signups, and answer product questions - without adding headcount every time your user base grows.
            </p>
          </div>

          {/* Agencies Card */}
          <div className="h-full flex flex-col p-8 rounded-[12px] bg-[var(--lp-surface)] border border-[var(--lp-border)] transition-all duration-300 hover:border-[var(--lp-gold)] hover:shadow-[0_0_24px_var(--lp-gold-glow)]">
            <AgencyIcon />
            <h3 className="font-cabinet font-bold text-xl text-[var(--lp-text)]">
              Agencies
            </h3>
            <p className="mt-2 text-sm text-[var(--lp-text-secondary)] leading-[22px] font-inter">
              Manage multiple client workspaces from one account. Each client gets their own inbox, their own bot, their own channels - and you get full visibility across all of them without switching tools.
            </p>
          </div>
        </div>

        <div className="mt-6 md:mt-8 text-center">
          <p className="text-base text-[var(--lp-text-secondary)] italic font-inter max-w-2xl mx-auto">
            Whatever your business looks like, your customers expect fast, clear answers. Yoosr makes that possible without burning out your team.
          </p>
        </div>
      </div>
    </div>
  )
}
