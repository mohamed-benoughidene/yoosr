import React from "react";
import { getTranslations } from "next-intl/server";

const stepsData = [
  {
    number: "01",
    code: 'workspace.create({ name: "Acme Support" })',
  },
  {
    number: "02",
    code: 'bot.publish({ channel: "web", flow: "main" })',
  },
  {
    number: "03",
    code: 'channels.connect(["web","telegram","meta"])',
  },
];

export async function HowItWorks() {
  const t = await getTranslations("landing");

  return (
    <section className="border-t border-border py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-primary" />
            <span className="text-xs font-mono uppercase tracking-widest text-primary font-medium">
              {t("howItWorks.badge")}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            {t("howItWorks.headline")}
          </h2>
          <p className="text-lg text-muted-foreground mt-3 max-w-2xl leading-relaxed">
            {t("howItWorks.description")}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
          {stepsData.map((step, index) => (
            <div key={index} className="relative group">
              {/* Step number label */}
              <div className="font-mono text-primary text-xs tracking-widest mb-5 font-semibold">
                {step.number}
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-bold mb-3">
                {t(`howItWorks.steps.${index}.title`)}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed min-h-[4rem]">
                {t(`howItWorks.steps.${index}.description`)}
              </p>

              {/* Code block */}
              <div className="bg-muted border border-border rounded-lg p-3 mt-5 font-mono text-xs text-primary leading-relaxed shadow-sm group-hover:shadow-md transition-shadow">
                {step.code}
              </div>

              {/* Connector line for desktop only */}
              {index < stepsData.length - 1 && (
                <div className="hidden md:block absolute w-full h-px bg-border top-[6px] left-1/2 translate-x-1/2 -z-10" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
