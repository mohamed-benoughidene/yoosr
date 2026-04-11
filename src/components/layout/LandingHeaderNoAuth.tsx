'use client';

import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import Image from 'next/image';
import { Github, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';

export function LandingHeaderNoAuth() {
  const t = useTranslations('landing.header');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-14 bg-[var(--lp-bg)] backdrop-blur-md border-b border-[var(--lp-border)]">
      <div className="mx-auto h-full flex flex-row items-center justify-between w-full max-w-[1200px] px-6">
        <Link
          href="/"
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          <Image
            src="/yoosr-light.svg"
            alt="Yoosr"
            height={32}
            width={100}
            className="h-8 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/docs"
            className="text-sm font-medium text-[var(--lp-text-secondary)] hover:text-[var(--lp-text)] transition-colors"
          >
            {t('nav.docs')}
          </Link>

          <a
            href="https://github.com/mohamed-benoughidene/yoosr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--lp-text-secondary)] hover:text-[var(--lp-text)] transition-colors"
            aria-label={t('github')}
          >
            <Github className="h-5 w-5" />
          </a>

          <div className="h-4 w-px bg-[var(--lp-border)]" />

          <Link
            href="/login"
            className="text-sm font-medium text-[var(--lp-text-secondary)] hover:text-[var(--lp-text)] transition-colors"
          >
            {t('login')}
          </Link>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 rounded-lg px-4 text-sm font-medium border-[var(--lp-border)] hover:border-[var(--lp-gold)] hover:text-[var(--lp-gold)] transition-all hover:-translate-y-0.5"
          >
            <Link href="/waitlist">
              {t('getEarlyAccess')}
            </Link>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-[var(--lp-text)] hover:text-[var(--lp-gold)] transition-colors"
          >
            {t('login')}
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-[var(--lp-text-secondary)] hover:text-[var(--lp-text)]">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[var(--lp-bg)] border-[var(--lp-border)] text-[var(--lp-text)]">
              <SheetHeader className="text-left mb-6">
                <SheetTitle className="text-[var(--lp-text)]">{t('logo')}</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4">
                <Link
                  href="/docs"
                  className="text-lg font-medium text-[var(--lp-text)] hover:text-[var(--lp-gold)] transition-colors"
                >
                  {t('nav.docs')}
                </Link>
                <a
                  href="https://github.com/mohamed-benoughidene/yoosr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-lg font-medium text-[var(--lp-text)] hover:text-[var(--lp-gold)] transition-colors"
                >
                  <Github className="h-5 w-5" />
                  GitHub
                </a>
                <div className="h-px bg-[var(--lp-border)] my-2" />
                <Button
                  asChild
                  className="w-full bg-[var(--lp-gold)] text-black hover:bg-[var(--lp-gold)]/90 font-semibold"
                >
                  <Link href="/waitlist">
                    {t('getEarlyAccess')}
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
