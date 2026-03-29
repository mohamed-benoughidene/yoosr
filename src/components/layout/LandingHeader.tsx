'use client';

export function LandingHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex" style={{ 
      height: '56px', 
      background: 'var(--lp-bg)', 
      backdropFilter: 'blur(12px)', 
      borderBottom: '1px solid var(--lp-border)' 
    }}>
      <div className="mx-auto h-full flex flex-row items-center justify-between w-full" style={{ maxWidth: '1200px', padding: '0 24px' }}>
        <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: 'var(--lp-text)' }}>
          Yoosr
        </div>
        <button 
          onClick={() => document.getElementById('waitlist-input')?.focus()}
          style={{
            border: '1px solid var(--lp-border)',
            color: 'var(--lp-text)',
            height: '36px',
            borderRadius: '8px',
            padding: '0 16px',
            fontSize: '14px',
            transition: 'all 100ms'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--lp-gold)';
            e.currentTarget.style.color = 'var(--lp-gold)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--lp-border)';
            e.currentTarget.style.color = 'var(--lp-text)';
          }}
        >
          Get Early Access
        </button>
      </div>
    </header>
  );
}
