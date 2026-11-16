"use client";

import { type ElementType, Fragment, type ReactNode, useEffect, useRef, useState } from "react";

/** True once the element has scrolled at least `amount` into view. Stays true. */
export function useInView<T extends HTMLElement>(amount = 0.25) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: amount },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [amount]);
  return [ref, inView] as const;
}

type RevealProps = {
  as?: ElementType;
  /** Stagger slot: each step adds 90 ms of delay. */
  delay?: number;
  className?: string;
  children: ReactNode;
};

/** Rises and fades in the first time it scrolls into view. Visible immediately with reduced motion. */
export function Reveal({ as: Tag = "div", delay = 0, className = "", children }: RevealProps) {
  const [ref, inView] = useInView<HTMLElement>(0.2);
  return (
    <Tag ref={ref} data-reveal="" data-in={inView || undefined} style={{ "--d": `${delay * 90}ms` }} className={className}>
      {children}
    </Tag>
  );
}

/** Splits a line into words that slide up out of a mask, one after another. */
export function RevealWords({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  const [ref, inView] = useInView<HTMLSpanElement>(0.3);
  const words = text.split(" ");
  return (
    <span ref={ref} data-in={inView || undefined} className={`reveal-words ${className}`}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="reveal-word">
            <span style={{ "--d": `${(delay + i) * 55}ms` }}>{w}</span>
          </span>
          {/* The space must sit outside the inline-block, or it collapses. */}
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}
