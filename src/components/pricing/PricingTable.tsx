"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Perfect for testing and small personal projects.",
    features: [
      "1 Seat",
      "200 Conversations/mo",
      "Basic Analytics",
      "Community Support",
      "Yoosr Branding",
    ],
    cta: "Start for free",
    popular: false,
  },
  {
    name: "Pro",
    monthlyPrice: 29,
    yearlyPrice: 290,
    description: "For growing businesses that need advanced features.",
    features: [
      "3 Seats",
      "2,000 Conversations/mo",
      "Advanced Analytics",
      "Email Support",
      "Remove Branding",
      "Departments",
      "Canned Responses",
    ],
    cta: "Start free trial",
    popular: true,
  },
  {
    name: "Business",
    monthlyPrice: 99,
    yearlyPrice: 990,
    description: "Scale your customer support with more seats and power.",
    features: [
      "10 Seats",
      "15,000 Conversations/mo",
      "Everything in Pro",
      "Priority Email Support",
      "Operating Hours",
      "Zapier Integration",
      "Webhooks",
    ],
    cta: "Start free trial",
    popular: false,
  },
  {
    name: "Enterprise",
    monthlyPrice: null,
    yearlyPrice: null,
    description: "For large organizations with custom requirements.",
    features: [
      "Unlimited Seats",
      "Unlimited Conversations",
      "Dedicated Success Manager",
      "SLA Support",
      "On-premise Deployment",
      "SSO & 2FA",
      "Custom Integrations",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function PricingTable() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="border-t border-border py-24">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-primary" />
            <span className="text-xs font-mono uppercase tracking-widest text-primary font-medium">
              Pricing
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Pricing plans for teams of all sizes
          </h2>
          <p className="text-lg text-muted-foreground mt-3 max-w-2xl">
            Choose the plan that's right for your business. No hidden fees.
          </p>

          {/* Toggle Section */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-3 border border-border rounded-full px-4 py-2 bg-muted/50">
              <span
                className={cn(
                  "text-sm cursor-pointer transition-colors",
                  !isYearly
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                )}
                onClick={() => setIsYearly(false)}
              >
                Monthly
              </span>
              <Switch checked={isYearly} onCheckedChange={setIsYearly} />
              <div className="flex items-center">
                <span
                  className={cn(
                    "text-sm cursor-pointer transition-colors",
                    isYearly
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  )}
                  onClick={() => setIsYearly(true)}
                >
                  Yearly
                </span>
                <span className="font-mono text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-1.5">
                  -20%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "border border-border rounded-2xl bg-card p-7 flex flex-col relative transition-all hover:-translate-y-0.5 hover:shadow-md h-full",
                plan.popular && "border-primary ring-1 ring-primary/20 shadow-lg"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                  Most Popular
                </div>
              )}

              <div className="mb-2">
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {plan.name}
                </span>
              </div>

              <div className="mb-2">
                {plan.monthlyPrice !== null ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight text-foreground">
                      $
                      {isYearly
                        ? Math.floor(plan.yearlyPrice! / 12)
                        : plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground text-sm font-normal">
                      /mo
                    </span>
                  </div>
                ) : (
                  <span className="text-4xl font-extrabold tracking-tight text-foreground">
                    Custom
                  </span>
                )}
              </div>

              <p className="text-sm text-muted-foreground mt-2 mb-6 min-h-[40px]">
                {plan.description}
              </p>

              <div className="flex-1 flex flex-col gap-3 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className={cn(
                  "mt-auto w-full",
                  plan.popular
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "border border-border bg-transparent text-foreground hover:bg-muted"
                )}
                variant={plan.popular ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
