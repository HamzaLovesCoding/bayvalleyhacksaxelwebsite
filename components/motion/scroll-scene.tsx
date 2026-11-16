"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";
import { type ProgressMode, track } from "@/lib/scroll";

/**
 * Tracks an element's scroll progress (see lib/scroll.ts). The element gets the CSS variable --p (0..1);
 * pass onProgress for effects CSS can't express.
 */
export function useScrollProgress<T extends HTMLElement>(mode: ProgressMode, onProgress?: (p: number) => void) {
  const ref = useRef<T>(null);
  const cb = useRef(onProgress);
  useEffect(() => {
    cb.current = onProgress;
  });
  useEffect(() => {
    if (!ref.current) return;
    return track(ref.current, mode, (p) => cb.current?.(p));
  }, [mode]);
  return ref;
}

type SceneProps = {
  id?: string;
  /** Total scroll length in viewport heights. The sticky stage stays pinned for (length - 100)vh. */
  length: number;
  className?: string;
  stageClassName?: string;
  style?: CSSProperties;
  onProgress?: (p: number) => void;
  /** Hold points for presenter keys, as progress values (see components/presenter-keys.tsx). */
  beats?: number[];
  children: ReactNode;
};

/** A tall section whose stage stays pinned while you scroll through it. Children read var(--p). */
export function ScrollScene({ id, length, className = "", stageClassName = "", style, onProgress, beats, children }: SceneProps) {
  const ref = useScrollProgress<HTMLElement>("pin", onProgress);
  return (
    <section ref={ref} id={id} data-beats={beats?.join(",")} className={`relative ${className}`} style={{ height: `${length}svh`, ...style }}>
      <div className={`sticky top-0 h-svh overflow-hidden ${stageClassName}`}>{children}</div>
    </section>
  );
}
