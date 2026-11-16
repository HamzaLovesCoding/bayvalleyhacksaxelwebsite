"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/ui/logo";
import { TrayDial } from "@/components/ui/tray-dial";
import { track } from "@/lib/scroll";
import { BRAND } from "@/lib/site";

const LINKS = [
  { angle: "030", label: "Problem", href: "#impact" },
  { angle: "060", label: "Elevate", href: "#ordinary" },
  { angle: "090", label: "How", href: "#how" },
  { angle: "120", label: "Arm", href: "#anatomy" },
  { angle: "180", label: "Build", href: "#build" },
];

// Colours follow the section on screen, so the bar reads on light and dark acts alike.
const shell =
  "h-[42px] rounded-full border border-[color-mix(in_srgb,var(--theme-fg,#1a1718)_10%,transparent)] bg-[color-mix(in_srgb,var(--theme-bg,#fafafa)_80%,transparent)] backdrop-blur-md";

export function Nav() {
  const bar = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const [angle, setAngle] = useState(0);

  // Page progress line.
  useEffect(() => (bar.current ? track(document.body, "pin", (p) => bar.current?.style.setProperty("--p", String(p))) : undefined), []);

  // Which section (data-angle) holds the middle of the screen.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = window.innerHeight / 2;
      for (const el of document.querySelectorAll<HTMLElement>("[data-angle]")) {
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) {
          setAngle(Number(el.dataset.angle));
          return;
        }
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", kick, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
    };
  }, []);

  // The readout steps through every degree, like the base turning.
  useEffect(() => {
    const el = readout.current;
    if (!el) return;
    const from = Number(el.dataset.value ?? 0);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / 420, 1);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const v = Math.round(from + (angle - from) * e);
      el.textContent = `${String(v).padStart(3, "0")}°`;
      el.dataset.value = String(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [angle]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div ref={bar} aria-hidden className="h-[2px] w-full origin-left bg-[var(--color-accent)]" style={{ transform: "scaleX(var(--p, 0))" }} />
      <nav className="mt-[18px] flex items-center justify-center gap-[10px] px-4 text-[var(--theme-fg,#1a1718)]" aria-label="Main">
        <Link href="#top" aria-label={`${BRAND}, back to top`} className={`${shell} flex items-center gap-2 px-4`}>
          <LogoMark className="h-[15px] w-auto" />
          <span className="text-[15px] font-semibold tracking-[-0.02em] lowercase">{BRAND}</span>
        </Link>
        <ul className={`${shell} hidden items-center gap-0.5 px-[5px] md:flex`}>
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={Number(link.angle) === angle ? "true" : undefined}
                className="flex h-[32px] items-center gap-1.5 rounded-full px-[12px] text-[13px] transition-colors hover:bg-[color-mix(in_srgb,var(--theme-fg,#1a1718)_8%,transparent)] aria-[current]:bg-[color-mix(in_srgb,var(--theme-fg,#1a1718)_10%,transparent)]"
              >
                <span className="font-mono text-[11px] text-[var(--theme-muted)] tabular-nums">{link.angle}</span>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className={`${shell} flex items-center gap-2 pr-4 pl-3`} title="Where the arm is pointing in the story">
          <TrayDial angle={angle} className="size-[22px]" />
          <span ref={readout} data-value="0" className="w-[38px] font-mono text-[13px] tabular-nums" aria-hidden>
            000°
          </span>
        </div>
      </nav>
    </header>
  );
}
