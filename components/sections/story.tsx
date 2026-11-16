"use client";

import { useRef } from "react";
import { useStoryAct } from "@/components/story-stage";
import { SectionLabel } from "@/components/ui/section-label";
import { showPhase } from "@/lib/arm/demo";
import { range } from "@/lib/scroll";
import { BRAND } from "@/lib/site";

// The pitch, told by the arm itself: scrolling plays "bring me my glasses", "release", "put it back".
const STEPS = [
  { at: 0, title: "Ask", line: `“${BRAND}, bring me my glasses.”`, voice: true },
  { at: 0.1, title: "Find", line: "The app knows the glasses live in position 2, which it maps to 30°." },
  { at: 0.23, title: "Reach and grip", line: `${BRAND} turns to 30°, reaches in and grips the case from both sides.` },
  { at: 0.35, title: "Bring", line: "It lifts clear of everything else on the tray and holds the glasses out to you." },
  { at: 0.5, title: "“Release.”", line: "The jaws stay closed until you say so, then open once you have hold of it.", voice: true },
  { at: 0.64, title: "“Put it back.”", line: `Hand it back when you’re done. ${BRAND} returns it to the spot it came from.`, voice: true },
];

export function Story() {
  const ref = useRef<HTMLElement>(null);
  const active = useRef(-1);

  useStoryAct(ref, (s, p) => {
    const mobile = window.innerWidth < 1024;
    if (p < 0.5) showPhase(s, "fetch", "glasses", range(p, 0.07, 0.48));
    else if (p < 0.64) showPhase(s, "release", "glasses", range(p, 0.51, 0.62));
    else showPhase(s, "return", "glasses", range(p, 0.66, 0.95));
    s.look({
      az: 205 - p * 25,
      el: 21,
      dist: mobile ? 1900 : 1450,
      target: [0, 70, 0],
      shift: mobile ? [0, 0.16] : [0.2, 0.03],
    });

    // Highlight the current step without a React render per frame.
    let i = 0;
    while (i + 1 < STEPS.length && p >= STEPS[i + 1].at) i++;
    if (i !== active.current && ref.current) {
      active.current = i;
      ref.current.querySelectorAll<HTMLElement>("[data-step]").forEach((el) => {
        el.toggleAttribute("data-active", Number(el.dataset.step) === i);
      });
    }
  });

  return (
    <section ref={ref} id="how" data-theme="sky" data-angle="90" data-beats="0.04,0.17,0.31,0.47,0.62,0.97" className="relative h-[480svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 px-6 pt-[clamp(96px,14svh,140px)] lg:inset-y-0 lg:right-auto lg:flex lg:w-[46%] lg:items-center lg:pt-0 lg:pl-[max(24px,6vw)]">
          <div className="w-full max-w-[520px]">
            <SectionLabel angle={90}>How it works</SectionLabel>
            <ol className="relative mt-6 lg:mt-8">
              {STEPS.map((step, i) => (
                <li
                  key={step.title}
                  data-step={i}
                  className="story-step grid grid-cols-[44px_1fr] gap-x-3 py-[clamp(6px,1.2svh,12px)] max-lg:absolute max-lg:inset-x-0 max-lg:top-0"
                >
                  <span className="pt-[0.45em] font-mono text-[12px] text-[var(--theme-muted)]">0{i + 1}</span>
                  <div>
                    <p className={`text-[clamp(26px,2.6vw,40px)] leading-[1.05] tracking-[-0.03em] ${step.voice ? "font-serif" : "font-[380]"}`}>
                      {step.title}
                    </p>
                    <div className="story-detail">
                      <p className="max-w-[420px] pt-2 text-[16px] leading-[1.4] text-[var(--theme-muted)]">{step.line}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <p className="absolute bottom-10 left-6 text-[12px] text-[var(--theme-muted)] lg:left-[6vw]">
          3D simulation of the team’s CAD. Tray layout is an example.
        </p>
        <div aria-hidden className="absolute inset-x-6 bottom-6 h-px bg-[var(--theme-line)] lg:inset-x-[6vw]">
          <div className="h-full origin-left bg-[var(--theme-fg)]" style={{ transform: "scaleX(var(--p, 0))" }} />
        </div>
      </div>
    </section>
  );
}
