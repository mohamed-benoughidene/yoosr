'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Github, Menu, Sun, Moon } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Logo } from './Logo';

export function LandingHeaderNoAuth() {
  const t = useTranslations('landing.header');
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-14 glass-nav">
      <div className="mx-auto h-full flex flex-row items-center justify-between w-full max-w-[1200px] px-6">
        <Logo />

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

          {mounted && (
            <button
              onClick={toggleTheme}
              className="text-[var(--lp-text-secondary)] hover:text-[var(--lp-text)] transition-colors p-1 rounded-lg hover:bg-[var(--lp-surface)]"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}

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
            style={{
              background: "var(--lp-glass-bg)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid var(--lp-glass-border)",
              color: "var(--lp-text)",
              transition: "all 200ms ease",
              position: "relative",
              overflow: "hidden",
            }}
            className="h-9 rounded-xl px-4 text-sm font-medium hover:bg-[var(--lp-gold)] hover:text-[var(--lp-on-primary)] hover:border-[var(--lp-gold)] hover:shadow-[0_0_8px_var(--lp-gold-glow)]"
          >
            <Link href="/waitlist" className="relative z-10">
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

                {mounted && (
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 text-lg font-medium text-[var(--lp-text)] hover:text-[var(--lp-gold)] transition-colors py-2"
                  >
                    {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    {resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </button>
                )}

                <div className="h-px bg-[var(--lp-border)] my-2" />
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-[var(--lp-gold)] to-[var(--lp-violet)] text-black hover:opacity-90 font-semibold"
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
