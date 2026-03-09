import React from "react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    quote:
      "The bot handles 70% of our tickets automatically. Our team finally spends time on real problems instead of answering the same questions every day.",
    author: "Sara Al-Amri",
    role: "Head of Support · Riyadh Store",
    initials: "SA",
    avatarStyles: "bg-primary text-primary-foreground",
  },
  {
    quote:
      "Finally a platform built for our region. Arabic routing, MENA-friendly channels, and SLA tracking that actually works. Switched from a European tool and won't go back.",
    author: "Karim Mansouri",
    role: "CTO · Algiers Tech",
    initials: "KM",
    avatarStyles: "bg-muted text-foreground",
  },
  {
    quote:
      "The Design Studio is genuinely different. Our ops team built and deployed a full order-tracking bot in an afternoon — no developers involved.",
    author: "Nour Rahmani",
    role: "Operations Lead · Dubai Boutique",
    initials: "NR",
    avatarStyles: "bg-muted text-foreground",
  },
];

export function Testimonials() {
  return (
    <section className="border-t border-border py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-primary" />
            <span className="text-xs font-mono uppercase tracking-widest text-primary font-medium">
              Customer stories
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Support teams across MENA choose Yoosr
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-14">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="border border-border rounded-2xl bg-card p-7 flex flex-col justify-between hover:bg-muted/30 transition-all group"
            >
              <div>
                <div className="flex text-sm text-primary tracking-widest mb-4">
                  {"★★★★★".split("").map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground mb-6 flex-1">
                  {t.quote}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0",
                    t.avatarStyles
                  )}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {t.author}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
