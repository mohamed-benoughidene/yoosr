import React from "react";
import { cn } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

export async function Testimonials() {
  const t = await getTranslations("landing");
  const items = t.raw("testimonials.items") as {
    quote: string;
    author: string;
    role: string;
    company: string;
  }[];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <section className="border-t border-border py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-primary" />
            <span className="text-xs font-mono uppercase tracking-widest text-primary font-medium">
              {t("testimonials.badge")}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            {t("testimonials.headline")}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-14">
          {items.map((item, idx) => (
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
                  {item.quote}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0",
                    idx === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  )}
                >
                  {getInitials(item.author)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {item.author}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {item.role} · {item.company}
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
