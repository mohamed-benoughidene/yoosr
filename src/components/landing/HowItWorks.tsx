import React from "react";

const steps = [
  {
    number: "01",
    title: "Create your workspace",
    description:
      "Sign up, create a Clerk organization, and your Convex project is provisioned instantly. Invite your team in seconds.",
    code: 'workspace.create({ name: "Acme Support" })',
  },
  {
    number: "02",
    title: "Build your bot",
    description:
      "Open the Design Studio. Drag blocks, set conditions, connect your knowledge base. Publish when ready.",
    code: 'bot.publish({ channel: "web", flow: "main" })',
  },
  {
    number: "03",
    title: "Go live everywhere",
    description:
      "Paste one script tag on your site. Connect Telegram, Facebook, or Instagram from the Integrations page. Done.",
    code: 'channels.connect(["web","telegram","meta"])',
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-border py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-primary" />
            <span className="text-xs font-mono uppercase tracking-widest text-primary font-medium">
              How it works
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Live in minutes, not weeks
          </h2>
          <p className="text-lg text-muted-foreground mt-3 max-w-2xl leading-relaxed">
            No infrastructure to manage. No long onboarding. Just build your bot
            and go live.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Step number label */}
              <div className="font-mono text-primary text-xs tracking-widest mb-5 font-semibold">
                {step.number}
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed min-h-[4rem]">
                {step.description}
              </p>

              {/* Code block */}
              <div className="bg-muted border border-border rounded-lg p-3 mt-5 font-mono text-xs text-primary leading-relaxed shadow-sm group-hover:shadow-md transition-shadow">
                {step.code}
              </div>

              {/* Connector line for desktop only */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute w-full h-px bg-border top-[6px] left-1/2 translate-x-1/2 -z-10" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
