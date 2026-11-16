"use client";

import { useEffect } from "react";

// Each section declares a palette with data-theme. As a boundary between two sections crosses the
// middle of the screen, the page colours blend from one palette to the next, so light and dark acts
// melt into each other instead of cutting. Colours land in CSS variables on <html>.
export const THEMES = {
  light: { bg: "#fafafa", fg: "#1a1718", muted: "#6f6f74", line: "#dde4f3" },
  sky: { bg: "#eaf4fc", fg: "#162033", muted: "#5d6b80", line: "#c9dcf2" },
  night: { bg: "#120f17", fg: "#f2f0f5", muted: "#9a95a6", line: "#2c2735" },
  /** The closing field: the page ends in the accent colour. */
  signal: { bg: "#46a5d8", fg: "#0e1218", muted: "#173247", line: "#2f7fac" },
} as const;

export type ThemeName = keyof typeof THEMES;
type Rgb = [number, number, number];

const hex = (h: string): Rgb => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb;
const PALETTES = Object.fromEntries(
  Object.entries(THEMES).map(([name, p]) => [name, Object.fromEntries(Object.entries(p).map(([k, v]) => [k, hex(v)]))]),
) as Record<ThemeName, Record<keyof (typeof THEMES)["light"], Rgb>>;

const mixRgb = (a: Rgb, b: Rgb, t: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(" ")})`;

export function ThemeScroll() {
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    let current = "";

    const update = () => {
      raf = 0;
      const sections = [...document.querySelectorAll<HTMLElement>("[data-theme]")];
      if (!sections.length) return;
      const mid = window.innerHeight / 2;
      const band = window.innerHeight * 0.3; // blend while the boundary is within ±30% of the middle
      let from = sections[0].dataset.theme as ThemeName;
      let to = from;
      let t = 0;
      for (let i = 0; i < sections.length; i++) {
        const r = sections[i].getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) {
          from = to = sections[i].dataset.theme as ThemeName;
          const next = sections[i + 1];
          const prev = sections[i - 1];
          if (next && r.bottom - mid < band) {
            to = next.dataset.theme as ThemeName;
            t = 0.5 - (r.bottom - mid) / (2 * band);
          } else if (prev && mid - r.top < band) {
            from = prev.dataset.theme as ThemeName;
            t = 0.5 + (mid - r.top) / (2 * band);
          } else t = 1;
          break;
        }
      }
      if (from === to) t = 1;
      t = t * t * (3 - 2 * t);
      const a = PALETTES[from] ?? PALETTES.light;
      const b = PALETTES[to] ?? PALETTES.light;
      const key = `${from}>${to}:${t.toFixed(3)}`;
      if (key === current) return;
      current = key;
      for (const k of Object.keys(a) as (keyof typeof a)[]) root.style.setProperty(`--theme-${k}`, mixRgb(a[k], b[k], t));
      root.dataset.tone = (t < 0.5 ? from : to) === "night" ? "dark" : "light";
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
    };
  }, []);
  return null;
}
