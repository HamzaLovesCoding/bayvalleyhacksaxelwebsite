"use client";

import { useEffect, useState } from "react";
import { useInView } from "@/components/motion/reveal";
import { prefersReducedMotion } from "@/lib/scroll";

type Props = { value: number; decimals?: number; prefix?: string; suffix?: string; duration?: number; className?: string };

/** Counts up to `value` the first time it scrolls into view. Screen readers get the final value. */
export function CountUp({ value, decimals = 0, prefix = "", suffix = "", duration = 1400, className = "" }: Props) {
  const [ref, inView] = useInView<HTMLSpanElement>(0.6);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const dur = prefersReducedMotion() ? 0 : duration;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = dur ? Math.min((now - start) / dur, 1) : 1;
      setShown(value * (1 - Math.pow(2, -10 * t))); // ease-out expo
      if (t < 1) raf = requestAnimationFrame(tick);
      else setShown(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);
  const text = `${prefix}${value.toFixed(decimals)}${suffix}`;
  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      <span aria-hidden>
        {prefix}
        {shown.toFixed(decimals)}
        {suffix}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
