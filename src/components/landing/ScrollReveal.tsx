"use client"

import { useEffect, useRef, ReactNode } from "react"

// Shared single observer for all ScrollReveal instances
let sharedObserver: IntersectionObserver | null = null;
const callbacks = new Map<Element, (entry: IntersectionObserverEntry) => void>();

function getObserver(): IntersectionObserver {
  if (typeof window === 'undefined') return null as any;
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const cb = callbacks.get(entry.target);
          if (cb) cb(entry);
        });
      },
      { threshold: 0.1 }
    );
  }
  return sharedObserver;
}

interface ScrollRevealProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function ScrollReveal({
  children,
  delay = 0,
  className = "",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = getObserver();
    if (!observer) return;
    
    const handleIntersection = (entry: IntersectionObserverEntry) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          el.classList.add("animate-fade-in")
          el.style.opacity = "1"
        }, delay)
        observer.unobserve(el)
        callbacks.delete(el)
      }
    };

    callbacks.set(el, handleIntersection);
    observer.observe(el)
    
    return () => {
      observer.unobserve(el)
      callbacks.delete(el)
    }
  }, [delay])

  return (
    <div
      ref={ref}
      className={className}
      style={{ opacity: 0 }}
    >
      {children}
    </div>
  )
}
