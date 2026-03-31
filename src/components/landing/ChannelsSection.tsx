"use client";
import React from "react";
import { ScrollReveal } from "./ScrollReveal";
import { Globe, Send, MessageCircle, Instagram } from "lucide-react";
import { useTranslations } from "next-intl";
import "./landing.css"

export function ChannelsSection() {
  const t = useTranslations("landingPage.channels");

  const channels = [
    {
      title: t("webWidget.title"),
      description: t("webWidget.description"),
      iconSVG: <Globe size={24} color="var(--lp-gold)" strokeWidth={1.5} />,
    },
    {
      title: t("telegram.title"),
      description: t("telegram.description"),
      iconSVG: <Send size={24} color="var(--lp-gold)" strokeWidth={1.5} />,
    },
    {
      title: t("messenger.title"),
      description: t("messenger.description"),
      iconSVG: <MessageCircle size={24} color="var(--lp-gold)" strokeWidth={1.5} />,
    },
    {
      title: t("instagram.title"),
      description: t("instagram.description"),
      iconSVG: <Instagram size={24} color="var(--lp-gold)" strokeWidth={1.5} />,
    },
  ];

  return (
    <section className="bg-[var(--lp-bg)] py-[64px] md:py-[120px] overflow-hidden" id="channels-section">

      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-10">
            <ScrollReveal>
              <div className="flex flex-col gap-4">
                <span className="ch-label">CHANNELS</span>
                <h2 className="ch-heading text-[36px] md:text-[48px] text-[var(--lp-text)]">
                  {t("headline")}
                </h2>
                <p className="ch-subheadline">
                  {t("subheadline")}
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {channels.map((channel, i) => (
                <ScrollReveal key={channel.title} delay={i * 100}>
                  <div className="group p-5 rounded-[10px] bg-[var(--lp-surface)] border border-[var(--lp-border)] hover:bg-[var(--lp-surface-2)] hover:border-[var(--lp-gold)] transition-all duration-300 h-full flex flex-col gap-4">
                    <div className="w-10 h-10 flex items-center justify-center">
                      {channel.iconSVG}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="ch-card-title">
                        {channel.title}
                      </h3>
                      <p className="text-[13px] text-[var(--lp-text-secondary)] font-['Inter'] leading-[1.5]">
                        {channel.description}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={500}>
              <p className="text-[14px] text-[var(--lp-text-secondary)] italic font-['Inter']">
                {t("closing")}
              </p>
            </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
