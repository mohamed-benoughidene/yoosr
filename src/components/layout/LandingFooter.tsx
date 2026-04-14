import { FooterLanguageSwitcher } from "@/components/FooterLanguageSwitcher";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Github, ArrowUpRight } from "lucide-react";
import { Logo } from "./Logo";

export function LandingFooter() {
  const t = useTranslations("landing.footer");
  return (
    <footer className="relative overflow-hidden" style={{ backgroundColor: "var(--lp-bg-deep)" }}>
      {/* Subtle top gradient accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, var(--lp-gold), var(--lp-violet), transparent)"
        }}
      />

      {/* Ambient glow */}
      <div
        className="absolute w-[500px] h-[300px] rounded-full pointer-events-none opacity-20"
        style={{
          background: "radial-gradient(ellipse, var(--lp-gold-alpha-15), transparent 70%)",
          filter: "blur(60px)",
          top: "-50%",
          right: "10%",
        }}
      />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="flex flex-col gap-5">
            <Logo />
            <p className="text-sm text-[var(--lp-text-muted)] leading-relaxed">
              {t("tagline")}
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/mohamed-benoughidene/yoosr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--lp-text-muted)] hover:text-[var(--lp-gold)] transition-colors p-2 rounded-lg hover:bg-[var(--lp-surface)]"
                aria-label={t("github")}
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="mailto:support@yoosr.app"
                className="text-sm text-[var(--lp-text-muted)] hover:text-[var(--lp-gold)] transition-colors"
              >
                support@yoosr.app
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold text-[var(--lp-text-secondary)] uppercase tracking-wider">
              Product
            </h3>
            <nav className="flex flex-col gap-2.5">
              <Link
                href="/docs"
                className="text-sm text-[var(--lp-text-muted)] hover:text-[var(--lp-gold)] transition-colors inline-flex items-center gap-1.5 group"
              >
                {t("legal.docs")}
                <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
              </Link>
              <Link
                href="/legal/terms"
                className="text-sm text-[var(--lp-text-muted)] hover:text-[var(--lp-gold)] transition-colors inline-flex items-center gap-1.5 group"
              >
                {t("legal.terms")}
                <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
              </Link>
              <Link
                href="/legal/privacy"
                className="text-sm text-[var(--lp-text-muted)] hover:text-[var(--lp-gold)] transition-colors inline-flex items-center gap-1.5 group"
              >
                {t("legal.privacy")}
                <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
              </Link>
            </nav>
          </div>

          {/* Resources Column */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold text-[var(--lp-text-secondary)] uppercase tracking-wider">
              Resources
            </h3>
            <nav className="flex flex-col gap-2.5">
              <a
                href="https://github.com/mohamed-benoughidene/yoosr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--lp-text-muted)] hover:text-[var(--lp-gold)] transition-colors inline-flex items-center gap-1.5 group"
              >
                GitHub
                <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
              </a>
              <Link
                href="/waitlist"
                className="text-sm text-[var(--lp-text-muted)] hover:text-[var(--lp-gold)] transition-colors inline-flex items-center gap-1.5 group"
              >
                Waitlist
                <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
              </Link>
            </nav>
          </div>

          {/* Language Column */}
          <div className="flex flex-col gap-4 lg:items-end">
            <h3 className="text-xs font-semibold text-[var(--lp-text-secondary)] uppercase tracking-wider">
              Language
            </h3>
            <div className="w-full lg:w-auto">
              <FooterLanguageSwitcher />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[var(--lp-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-[var(--lp-text-muted)]">
            © 2026 Yoosr, Inc.
          </span>
          <span className="text-xs text-[var(--lp-text-muted)]">
            {t("copyright")}
          </span>
        </div>
      </div>
    </footer>
  );
}
