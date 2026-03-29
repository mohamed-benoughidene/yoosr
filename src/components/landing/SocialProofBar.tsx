"use client";

import React from "react";
import { useRouter } from "next/navigation";

export function SocialProofBar() {
  const router = useRouter();
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/waitlist');
  };

  const Item = () => (
    <div className="flex items-center whitespace-nowrap text-[13px] font-medium text-[var(--lp-text-secondary)]">
      <span className="ml-[12px] mr-[12px]">🟢 Early Access</span>
      <span className="text-[var(--lp-gold)]">·</span>
      <span className="mx-[12px]">4 channels, one inbox</span>
      <span className="text-[var(--lp-gold)]">·</span>
      <span className="mx-[12px]">AI + human handoff</span>
      <span className="text-[var(--lp-gold)]">·</span>
      <span className="mx-[12px]">No-code automation</span>
      <span className="text-[var(--lp-gold)]">·</span>
      <span className="mx-[12px] flex items-center">
        Join 50+ teams on the waitlist{" "}
        <button
          type="button"
          onClick={handleClick}
          className="ml-1 inline-flex items-center text-[var(--lp-gold)] transition-opacity hover:opacity-80 focus:outline-none"
        >
          → Get Early Access
        </button>
      </span>
      <span className="text-[var(--lp-gold)]">·</span>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes scroll-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333333%);
          }
        }
        .animate-marquee {
          animation: scroll-marquee 30s linear infinite;
        }
      `}</style>
      <div 
        className="group flex h-[48px] w-full items-center overflow-hidden border-y border-[var(--lp-border)] bg-[var(--lp-surface)]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <div className="animate-marquee flex w-max items-center group-hover:[animation-play-state:paused]">
          <Item />
          <Item />
          <Item />
        </div>
      </div>
    </>
  );
}
