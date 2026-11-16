import Image from "next/image";
import { ScrollScene } from "@/components/motion/scroll-scene";
import { SectionLabel } from "@/components/ui/section-label";
import { BRAND } from "@/lib/site";

const PARTS = [
  { name: "Upper arm", tag: "Custom", image: "/arm/upper.png", note: "Hex-lattice link, 120 mm" },
  { name: "Forearm", tag: "Custom", image: "/arm/fore.png", note: "Carries the elbow and wrist servos" },
  { name: "Base", tag: "Custom", image: "/arm/base.png", note: "Turntable on 8 V-groove bearings" },
  { name: "Gripper", tag: "Custom", image: "/arm/grip.png", note: "Rack-and-pinion jaws, ridged pads" },
  { name: "Wrist & camera", tag: "Custom", image: "/arm/wrist.png", note: "Gripper servo and camera mount" },
  { name: "Servos", tag: "Off the shelf", image: "/arm/servos.png", note: "5 × MG996R, metric screws" },
];

// The row slides sideways while the section is pinned: scrolling down walks through the parts.
export function Rebuild() {
  return (
    <section id="build" data-theme="light" data-angle="180" className="relative">
      <ScrollScene length={240} beats={[0.55]} stageClassName="flex flex-col justify-center gap-[6svh]">
        <div className="mx-auto grid w-full max-w-[1180px] gap-6 px-6 md:grid-cols-[1fr_1fr] md:items-end">
          <div>
            <SectionLabel angle={180}>The build</SectionLabel>
            <h2 className="mt-5 text-[clamp(40px,5vw,76px)] leading-[0.95] font-[380] tracking-[-0.045em]">Built to be rebuilt.</h2>
          </div>
          <p className="max-w-[480px] text-[17px] leading-[1.45] text-[var(--theme-muted)]">
            Assistive tech should be easy to keep running for the people who rely on it. Every part of {BRAND} is either a
            custom part from the team’s CAD or a standard part you can order. If one breaks, you replace that part, not
            the arm. It all comes apart with a set of hex keys.
          </p>
        </div>
        <div className="overflow-hidden">
          <ul
            className="flex w-max gap-6 pl-[max(24px,calc((100vw-1180px)/2+24px))] will-change-transform [--card:clamp(260px,28vw,400px)]"
            style={{ transform: "translateX(calc(var(--p, 0) * (100vw - (6 * var(--card) + 5 * 24px) - 2 * max(24px, calc((100vw - 1180px) / 2 + 24px)))))" }}
          >
            {PARTS.map((part) => (
              <li key={part.name} className="w-[var(--card)] shrink-0">
                <div className="relative aspect-[4/3.4] overflow-hidden rounded-[22px] bg-[color-mix(in_srgb,var(--color-sky)_28%,var(--theme-bg))]">
                  <Image src={part.image} alt={`${part.name} render`} fill sizes="400px" className="object-contain p-[9%]" />
                  <span className="absolute top-4 left-4 rounded-full bg-[var(--theme-bg)]/85 px-3 py-1 text-[12px] tracking-[0.06em] uppercase">
                    {part.tag}
                  </span>
                </div>
                <p className="mt-4 text-[20px] tracking-[-0.02em]">{part.name}</p>
                <p className="mt-1 text-[15px] text-[var(--theme-muted)]">{part.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </ScrollScene>
    </section>
  );
}
