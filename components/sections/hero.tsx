"use client";

import { useRef } from "react";
import { RevealWords } from "@/components/motion/reveal";
import { useStoryAct } from "@/components/story-stage";
import { PillButton } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/section-label";
import { poseFor, READY } from "@/lib/arm/choreo";
import { ease, range } from "@/lib/scroll";
import { BRAND } from "@/lib/site";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  useStoryAct(ref, (s, p) => {
    const t = ease(range(p, 0.25, 1));
    const mobile = window.innerWidth < 768;
    s.tray?.reset();
    s.rig.setPose(poseFor(READY));
    // Starts small and low under the headline, then rises and comes closer as the headline lifts away.
    s.look({
      az: 132 - 42 * t,
      el: 22 - 6 * t,
      dist: (mobile ? 2600 : 2250) - 800 * t,
      target: [0, 30, 0],
      shift: [0, 0.34 - 0.28 * t],
    });
  });

  return (
    <section ref={ref} id="top" data-theme="light" data-angle="0" className="relative h-[190svh]">
      <div className="sticky top-0 flex h-svh flex-col items-center overflow-hidden px-5 pt-[clamp(110px,17svh,170px)] text-center">
        <div
          className="flex flex-col items-center will-change-transform"
          style={{ opacity: "clamp(0, calc(1 - (var(--p, 0) - 0.25) * 3), 1)", transform: "translateY(calc(max(var(--p, 0) - 0.25, 0) * -180px))" }}
        >
          <SectionLabel angle={0}>Assistive robotics for arthritis</SectionLabel>
          <h1 className="mt-5 text-[clamp(46px,7.4vw,118px)] leading-[0.92] font-[380] tracking-[-0.045em]">
            <RevealWords text="Ask for it." />
            <br />
            <RevealWords text={`${BRAND} hands it over.`} delay={3} />
          </h1>
          <p className="mt-6 max-w-[520px] text-[clamp(16px,1.35vw,19px)] leading-[1.4] text-[var(--theme-muted)]">
            {BRAND} is a voice-controlled robot arm that fetches everyday things from its tray (glasses, water, pills)
            and hands them over.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <PillButton href="#how" variant="solid" dot>
              Watch it work
            </PillButton>
            <PillButton href="#ordinary">Elevating the ordinary</PillButton>
          </div>
        </div>

        {/* Kept in the left gutter, not centred: the arm stands in the middle and the cue would sit on its base.
            Hidden on phones, where the tray fills the whole bottom edge. */}
        <div
          aria-hidden
          className="absolute bottom-7 left-6 hidden flex-col items-start gap-3 text-[11px] tracking-[0.2em] text-[var(--theme-muted)] uppercase md:flex lg:left-[6vw]"
          style={{ opacity: "clamp(0, calc(1 - var(--p, 0) * 6), 1)" }}
        >
          Scroll
          <span className="scroll-cue h-10 w-px bg-current" />
        </div>
      </div>
    </section>
  );
}
