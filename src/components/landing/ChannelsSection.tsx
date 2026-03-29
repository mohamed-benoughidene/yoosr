"use client";

import React from "react";
import { ScrollReveal } from "./ScrollReveal";
import { Globe, Send, MessageCircle, Instagram } from "lucide-react";

const channels = [
  {
    title: "Web Widget",
    description: "Embed on any website in minutes. Fully customizable - your colors, your logo, your welcome message.",
    iconSVG: <Globe size={24} color="var(--lp-gold)" strokeWidth={1.5} />,
  },
  {
    title: "Telegram",
    description: "Connect your Telegram bot in one click. No app review, no business verification, no waiting. Just connect and go.",
    iconSVG: <Send size={24} color="var(--lp-gold)" strokeWidth={1.5} />,
  },
  {
    title: "Facebook Messenger",
    description: "Every Messenger conversation from your Facebook page lands directly in your Yoosr inbox - ready to handle or automate.",
    iconSVG: <MessageCircle size={24} color="var(--lp-gold)" strokeWidth={1.5} />,
  },
  {
    title: "Instagram DMs",
    description: "Turn Instagram DMs into managed support conversations. Same inbox, same team, same bot.",
    iconSVG: <Instagram size={24} color="var(--lp-gold)" strokeWidth={1.5} />,
  },
];

export function ChannelsSection() {
  return (
    <section className="bg-[var(--lp-bg)] py-[64px] md:py-[120px] overflow-hidden" id="channels-section">
      <style dangerouslySetInnerHTML={{ __html: `
        .ch-heading {
          font-family: 'Cabinet Grotesk', sans-serif;
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.03em;
        }
        .ch-card-title {
          font-family: 'Cabinet Grotesk', sans-serif;
          font-weight: 600;
          font-size: 15px;
          color: var(--lp-text);
        }
        .ch-label {
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 11px;
          color: var(--lp-gold);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 16px;
        }
        .ch-subheadline {
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          font-size: 18px;
          color: var(--lp-text-secondary);
          line-height: 28px;
          max-width: 520px;
        }
      `}} />

      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-10">
            <ScrollReveal>
              <div className="flex flex-col gap-4">
                <span className="ch-label">CHANNELS</span>
                <h2 className="ch-heading text-[36px] md:text-[48px] text-[var(--lp-text)]">
                  Meet your customers where they already are.
                </h2>
                <p className="ch-subheadline">
                  Your customers don't switch apps for you. Yoosr connects to the channels they're already using - and routes every message into one unified inbox.
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
                One team. One inbox. Every channel handled.
              </p>
            </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
