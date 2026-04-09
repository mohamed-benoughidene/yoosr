'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import Image from 'next/image';

export function LandingHeaderNoAuth() {
  const t = useTranslations('landing.header');
  const locale = useLocale();
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex" style={{
      height: '56px',
      background: 'var(--lp-bg)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--lp-border)'
    }}>
      <div className="mx-auto h-full flex flex-row items-center justify-between w-full" style={{ maxWidth: '1200px', padding: '0 24px' }}>
        <button
          type="button"
          onClick={() => router.push(`/${locale}`)}
          className="flex items-center bg-transparent border-none p-0"
          style={{ cursor: 'pointer' }}
        >
          <Image
            src="/yoosr-light.svg"
            alt="Yoosr"
            height={32}
            width={100}
            className="h-8 w-auto"
          />
        </button>

        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push('/login')}
            style={{
              color: 'var(--lp-text-secondary)',
              fontSize: '14px',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 100ms'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--lp-text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--lp-text-secondary)';
            }}
          >
            {t('login')}
          </button>
          <button
            onClick={() => router.push('/waitlist')}
            style={{
              border: '1px solid var(--lp-border)',
              backgroundColor: 'transparent',
              color: 'var(--lp-text)',
              height: '36px',
              borderRadius: '8px',
              padding: '0 16px',
              fontSize: '14px',
              transition: 'border-color 100ms, color 100ms, transform 100ms',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--lp-gold)';
              e.currentTarget.style.color = 'var(--lp-gold)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--lp-border)';
              e.currentTarget.style.color = 'var(--lp-text)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {t('getEarlyAccess')}
          </button>
        </div>
      </div>
    </header>
  );
}
