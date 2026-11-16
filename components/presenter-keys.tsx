"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/scroll";

// Presentation clickers send PageDown / PageUp (or the arrow keys). Each press moves to the next "beat":
// - a pinned section lists hold points as progress values: data-beats="0.05,0.3,0.6"
// - any other section with data-angle or data-beat is one beat at its top.
function beats() {
  const y = window.scrollY;
  const vh = window.innerHeight;
  const out: number[] = [];
  for (const el of document.querySelectorAll<HTMLElement>("[data-beats]")) {
    const r = el.getBoundingClientRect();
    const top = r.top + y;
    const travel = Math.max(r.height - vh, 0);
    for (const p of el.dataset.beats!.split(",")) out.push(Math.round(top + Number(p) * travel));
  }
  for (const el of document.querySelectorAll<HTMLElement>("[data-angle], [data-beat]")) {
    if (el.querySelector("[data-beats]") || el.hasAttribute("data-beats")) continue;
    out.push(Math.round(el.getBoundingClientRect().top + y));
  }
  return [...new Set(out)].sort((a, b) => a - b);
}

export function PresenterKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, [contenteditable]")) return;
      const forward = e.key === "PageDown" || e.key === "ArrowRight";
      const back = e.key === "PageUp" || e.key === "ArrowLeft";
      if (!forward && !back) return;
      const y = window.scrollY;
      const list = beats();
      const next = forward ? list.find((b) => b > y + 4) : [...list].reverse().find((b) => b < y - 4);
      if (next === undefined) return;
      e.preventDefault();
      window.scrollTo({ top: next, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
