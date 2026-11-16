"use client";

import { useRef } from "react";
import { useStoryAct } from "@/components/story-stage";
import { SectionLabel } from "@/components/ui/section-label";
import { poseFor } from "@/lib/arm/choreo";
import type { ArmPart } from "@/lib/arm/rig";
import { ease, range } from "@/lib/scroll";
import { BRAND } from "@/lib/site";

// From the team's CAD. Each part lights up in turn while the camera circles the arm.
const PARTS: { ids: ArmPart[]; name: string; stat: string; body: string }[] = [
  { ids: ["base"], name: "Base & turntable", stat: "8 bearings", body: `Swings ${BRAND} round to face any spot on the tray.` },
  { ids: ["shoulder", "upper", "fore"], name: "Shoulder & links", stat: "2 links", body: "Two equal links reach across the tray and lift things clear." },
  { ids: ["wrist"], name: "Wrist & camera", stat: "1 camera", body: "Keeps the gripper steady. The camera looks wherever the jaws point." },
  { ids: ["gripper"], name: "Gripper", stat: "2 jaws", body: "One servo closes both jaws evenly, so whatever it holds stays centered." },
  { ids: ["servos"], name: "Five servos", stat: "5 servos", body: "One metal-gear servo per joint. Everything else is see-through here." },
];

const START = 0.1;
const SPAN = (0.92 - START) / PARTS.length;
// Presenter-key hold points: the middle of each part's stretch.
const BEATS = PARTS.map((_, i) => (START + SPAN * (i + 0.5)).toFixed(3)).join(",");

export function TheArm() {
  const ref = useRef<HTMLElement>(null);
  const active = useRef(-2);

  useStoryAct(ref, (s, p) => {
    const mobile = window.innerWidth < 1024;
    const i = p < START || p >= 0.92 ? -1 : Math.floor((p - START) / SPAN);
    s.tray?.reset();
    if (s.tray) s.tray.group.visible = false;
    // A showcase pose that slowly turns on the base, so every side gets its moment.
    const t = ease(range(p, 0, 1));
    s.rig.setPose(poseFor({ angle: 150 - 70 * t, distance: 185, height: 215, pitch: 8, grip: 7 }));
    s.rig.highlight(i >= 0 ? PARTS[i].ids : null);
    s.look({ az: 60 + 120 * t, el: 14 + 10 * t, dist: mobile ? 1250 : 980, target: [0, 85, 0], shift: mobile ? [0, 0.2] : [0.2, 0.02] });

    if (i !== active.current && ref.current) {
      active.current = i;
      ref.current.querySelectorAll<HTMLElement>("[data-step]").forEach((el) => el.toggleAttribute("data-active", Number(el.dataset.step) === i));
    }
  });

  return (
    <section ref={ref} id="anatomy" data-theme="night" data-angle="120" data-beats={BEATS} className="relative h-[430svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 px-6 pt-[clamp(96px,14svh,140px)] lg:inset-y-0 lg:right-auto lg:flex lg:w-[46%] lg:items-center lg:pt-0 lg:pl-[max(24px,6vw)]">
          <div className="w-full max-w-[520px]">
            <SectionLabel angle={120}>The arm</SectionLabel>
            <h2 className="mt-5 text-[clamp(40px,4.8vw,76px)] leading-[0.95] font-[380] tracking-[-0.045em]">Built joint by joint.</h2>
            <p className="mt-5 max-w-[440px] text-[17px] leading-[1.45] text-[var(--theme-muted)]">
              Four axes, a gripper and 103 parts, straight from the team’s CAD.
            </p>
            <ol className="relative mt-8 min-h-[150px]">
              {PARTS.map((part, i) => (
                <li key={part.name} data-step={i} className="arm-part absolute inset-x-0 top-0">
                  <p className="font-mono text-[12px] text-[var(--theme-muted)]">
                    0{i + 1} / 0{PARTS.length}
                  </p>
                  <p className="mt-2 flex items-baseline justify-between gap-6 border-b border-[var(--theme-line)] pb-3">
                    <span className="text-[clamp(26px,2.4vw,36px)] tracking-[-0.03em]">{part.name}</span>
                    <span className="font-serif text-[clamp(20px,1.8vw,26px)] text-[var(--color-sky)]">{part.stat}</span>
                  </p>
                  <p className="mt-3 max-w-[440px] text-[16px] leading-[1.45] text-[var(--theme-muted)]">{part.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div aria-hidden className="absolute inset-x-6 bottom-6 flex gap-1.5 lg:inset-x-[6vw]">
          {PARTS.map((part, i) => (
            <span key={part.name} data-step={i} className="arm-tick h-[2px] flex-1 bg-[var(--theme-line)]" />
          ))}
        </div>
      </div>
    </section>
  );
}
