import { FooterLanguageSwitcher } from "@/components/FooterLanguageSwitcher";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Github } from "lucide-react";

export function LandingFooter() {
  const t = useTranslations("landing.footer");
  return (
    <footer className="bg-[var(--lp-surface)] border-t border-[var(--lp-border)] py-12 md:py-16">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8">
          {/* Brand & Stats */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Image
                src="/yoosr-light.svg"
                alt="Yoosr"
                height={24}
                width={76}
                className="h-6 w-auto"
              />
            </Link>
            <p className="text-sm text-[var(--lp-text-muted)] max-w-sm leading-relaxed">
              {t("tagline")}
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/mohamed-benoughidene/yoosr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--lp-text-muted)] hover:text-[var(--lp-text)] transition-colors p-2 -ml-2"
                aria-label={t("github")}
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="mailto:support@yoosr.app"
                className="text-sm text-[var(--lp-text-muted)] hover:text-[var(--lp-text)] transition-colors"
              >
                support@yoosr.app
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-semibold text-[var(--lp-text)] uppercase tracking-wider">
              Resources
            </h3>
            <nav className="flex flex-col gap-3">
              <Link
                href="/docs"
                className="text-sm text-[var(--lp-text-muted)] hover:text-[var(--lp-gold)] transition-colors"
              >
                {t("legal.docs")}
              </Link>
              <Link
                href="/legal/terms"
                className="text-sm text-[var(--lp-text-muted)] hover:text-[var(--lp-gold)] transition-colors"
              >
                {t("legal.terms")}
              </Link>
              <Link
                href="/legal/privacy"
                className="text-sm text-[var(--lp-text-muted)] hover:text-[var(--lp-gold)] transition-colors"
              >
                {t("legal.privacy")}
              </Link>
            </nav>
          </div>

          {/* Language & Extra */}
          <div className="flex flex-col gap-6 lg:items-end">
            <div className="w-full lg:w-auto">
              <FooterLanguageSwitcher />
            </div>
            <div className="pt-8 mt-auto border-t border-[var(--lp-border)] w-full lg:border-t-0 flex flex-col gap-2 lg:items-end leading-none">
              <span className="text-xs text-[var(--lp-text-muted)]">
                © 2026 Yoosr, Inc.
              </span>
              <span className="text-xs text-[var(--lp-text-muted)]">
                {t("copyright")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
