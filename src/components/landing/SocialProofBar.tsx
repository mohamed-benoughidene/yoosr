"use client";

import React from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

interface ItemProps {
  t: ReturnType<typeof useTranslations>;
  handleClick: (e: React.MouseEvent) => void;
}

// Move Item component outside to avoid creating it during render
const Item: React.FC<ItemProps> = ({ t, handleClick }) => {
  const parts = t("bar").split(" | ");
  return (
    <div className="flex items-center whitespace-nowrap text-[13px] font-medium text-[var(--lp-text-secondary)]">
      <span className="ml-[12px] mr-[12px]">🟢 {parts[0]}</span>
      <span className="text-[var(--lp-gold)]">·</span>
      <span className="mx-[12px]">{parts[1]}</span>
      <span className="text-[var(--lp-gold)]">·</span>
      <span className="mx-[12px]">{parts[2]}</span>
      <span className="text-[var(--lp-gold)]">·</span>
      <span className="mx-[12px]">{parts[3]}</span>
      <span className="text-[var(--lp-gold)]">·</span>
      <span className="mx-[12px] flex items-center">
        {parts[4]}{" "}
        <button
          type="button"
          onClick={handleClick}
          className="ml-1 inline-flex items-center text-[var(--lp-gold)] transition-opacity hover:opacity-80 focus:outline-none"
        >
          → Get {parts[0]}
        </button>
      </span>
      <span className="text-[var(--lp-gold)]">·</span>
    </div>
  );
};

export function SocialProofBar() {
  const t = useTranslations("landingPage.socialProof");
  const router = useRouter();
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/waitlist');
  };

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
        className="group flex h-[48px] w-full items-center overflow-hidden marquee-glass"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <div className="animate-marquee flex w-max items-center group-hover:[animation-play-state:paused]">
          <Item t={t} handleClick={handleClick} />
          <Item t={t} handleClick={handleClick} />
          <Item t={t} handleClick={handleClick} />
        </div>
      </div>
    </>
  );
}
