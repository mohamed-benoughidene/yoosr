import React from "react";
import { getTranslations } from "next-intl/server";

const icons = ["🛒", "📦", "📤", "🔔"];

export async function OrdersSection() {
  const t = await getTranslations("landing");
  const items = t.raw("orders.items") as { title: string; description: string }[];

  return (
    <section className="border-t border-border py-24">
      <div className="container mx-auto px-4">
        {/* Centered Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-px bg-primary" />
            <span className="text-xs font-mono uppercase tracking-widest text-primary font-medium">
              {t("orders.badge")}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            {t("orders.headline")}
          </h2>
          <p className="text-lg text-muted-foreground mt-3 leading-relaxed">
            {t("orders.description" as any)}
          </p>
        </div>

        {/* 4-card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((feature, index) => (
            <div
              key={index}
              className="border border-border rounded-xl bg-card p-6 flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center text-lg flex-shrink-0 mb-1">
                {icons[index] || "✨"}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
