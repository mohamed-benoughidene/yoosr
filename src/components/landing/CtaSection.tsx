import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="border-t border-border py-24">
      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl bg-primary px-8 py-20 md:px-16 lg:px-24 overflow-hidden text-center">
          {/* Background Decoration */}
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-primary-foreground/5 blur-3xl pointer-events-none -z-0" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-primary-foreground/5 blur-3xl pointer-events-none -z-0" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-primary-foreground/30" />
              <span className="text-xs font-mono uppercase tracking-widest text-primary-foreground/60 font-medium">
                Get started
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-primary-foreground max-w-2xl mx-auto">
              Your support team deserves better tools.
            </h2>

            <p className="text-lg text-primary-foreground/80 mt-5 mb-10 max-w-xl mx-auto leading-relaxed">
              Set up your workspace, embed the widget, and have your first bot
              live today — no credit card required.
            </p>

            <div className="flex justify-center gap-4 flex-wrap">
              <Button
                size="lg"
                variant="secondary"
                className="bg-background text-foreground font-semibold hover:bg-muted transition-colors px-8"
                asChild
              >
                <Link href="/signup">Start for free →</Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors px-8"
                asChild
              >
                <Link href="/demo">Talk to us</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
