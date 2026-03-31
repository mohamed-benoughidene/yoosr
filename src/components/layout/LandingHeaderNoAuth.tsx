'use client';

import { useRouter } from 'next/navigation';

export function LandingHeaderNoAuth() {
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex" style={{
      height: '56px',
      background: 'var(--lp-bg)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--lp-border)'
    }}>
      <div className="mx-auto h-full flex flex-row items-center justify-between w-full" style={{ maxWidth: '1200px', padding: '0 24px' }}>
        <div
          onClick={() => router.push('/')}
          className="flex items-center"
          style={{ cursor: 'pointer' }}
        >
          <img
            src="/yoosr-light.svg"
            alt="Yoosr"
            height={32}
            className="h-8 w-auto"
          />
        </div>

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
            Login
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
              transition: 'all 100ms',
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
            Get Early Access
          </button>
        </div>
      </div>
    </header>
  );
}
