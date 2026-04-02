import { FooterLanguageSwitcher } from "@/components/FooterLanguageSwitcher";
import Image from "next/image";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="bg-[var(--lp-surface)] border-t border-[var(--lp-border)]">
      <div className="mx-auto flex max-w-[1200px] px-4 py-8 md:px-6 md:py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between w-full">
          {/* Brand & Info */}
          <div className="flex flex-col gap-3 items-start">
            <Image
              src="/yoosr-light.svg"
              alt="Yoosr"
              height={24}
              width={76}
              className="h-6 w-auto"
            />
            <span className="text-sm text-[var(--lp-text-muted)]">
              © 2026 Yoosr
            </span>
            <a
              href="mailto:support@yoosr.app"
              className="text-sm text-[var(--lp-text-muted)] transition-colors hover:text-[var(--lp-gold)]"
            >
              support@yoosr.app
            </a>
            {/* Legal Links */}
            <nav className="flex items-center gap-2 text-sm text-[var(--lp-text-muted)]" aria-label="Legal links">
              <Link
                href="/legal/terms"
                className="transition-colors hover:text-[var(--lp-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--lp-gold)] focus:ring-offset-2 focus:ring-offset-[var(--lp-surface)] rounded"
              >
                Terms of Service
              </Link>
              <span aria-hidden="true">·</span>
              <Link
                href="/legal/privacy"
                className="transition-colors hover:text-[var(--lp-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--lp-gold)] focus:ring-offset-2 focus:ring-offset-[var(--lp-surface)] rounded"
              >
                Privacy Policy
              </Link>
            </nav>
          </div>
          {/* Language Switcher */}
          <FooterLanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
