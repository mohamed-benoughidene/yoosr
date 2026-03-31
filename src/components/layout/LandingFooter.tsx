import { FooterLanguageSwitcher } from "@/components/FooterLanguageSwitcher";
import Image from "next/image";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer style={{ background: 'var(--lp-surface)', borderTop: '1px solid var(--lp-border)', padding: '32px 24px' }}>
      <div className="mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4" style={{ maxWidth: '1200px' }}>
        <div className="flex flex-col gap-1">
          <Image
            src="/yoosr-light.svg"
            alt="Yoosr"
            height={24}
            width={76}
            className="h-6 w-auto mb-1"
          />
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '13px', color: 'var(--lp-text-muted)' }}>
            © 2026 Yoosr
          </span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '13px', color: 'var(--lp-text-muted)' }}>
            support@yoosr.app
          </span>
          <div className="flex gap-2" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '13px', color: 'var(--lp-text-muted)' }}>
            <Link href="/legal/terms" className="hover:text-[var(--lp-gold)] transition-colors">Terms of Service</Link>
            <span>·</span>
            <Link href="/legal/privacy" className="hover:text-[var(--lp-gold)] transition-colors">Privacy Policy</Link>
          </div>
        </div>
        <FooterLanguageSwitcher />
      </div>
    </footer>
  );
}
