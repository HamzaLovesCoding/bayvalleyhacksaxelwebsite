import { Reveal } from "@/components/motion/reveal";
import { SectionLabel } from "@/components/ui/section-label";

// Worked example for glasses in position 2: θ = 30°, r = 250 mm (the tray radius used on this page).
const R = 250;
const THETA = 30;
const X = Math.round(R * Math.cos((THETA * Math.PI) / 180) * 10) / 10; // 216.5
const Y = Math.round(R * Math.sin((THETA * Math.PI) / 180) * 10) / 10; // 125

const stroke = "stroke-[var(--theme-fg)]";
const faint = "stroke-[var(--theme-line)]";

function Polar() {
  // Tray seen from above, base at the centre, the item at 30°.
  const px = 100 + 70 * Math.cos(Math.PI / 6);
  const py = 100 - 70 * Math.sin(Math.PI / 6);
  return (
    <svg viewBox="0 0 200 200" className="w-full" aria-hidden>
      <circle cx="100" cy="100" r="86" className={faint} fill="none" strokeWidth="1" />
      <line x1="100" y1="100" x2="186" y2="100" className={faint} strokeWidth="1" strokeDasharray="3 4" />
      <path d="M128 100 A28 28 0 0 0 124.2 86" className={stroke} fill="none" strokeWidth="1.2" />
      <line x1="100" y1="100" x2={px} y2={py} className={`${stroke} draw`} strokeWidth="1.6" pathLength={1} />
      <circle cx="100" cy="100" r="7" className="fill-[var(--theme-fg)]" />
      <circle cx={px} cy={py} r="6" className="fill-[var(--color-accent)]" />
      <text x="134" y="94" className="fill-[var(--theme-muted)] text-[9px]">30°</text>
    </svg>
  );
}

function Rect() {
  const px = 100 + 70 * Math.cos(Math.PI / 6);
  const py = 100 - 70 * Math.sin(Math.PI / 6);
  return (
    <svg viewBox="0 0 200 200" className="w-full" aria-hidden>
      <line x1="30" y1="100" x2="186" y2="100" className={faint} strokeWidth="1" />
      <line x1="100" y1="170" x2="100" y2="20" className={faint} strokeWidth="1" />
      <line x1="100" y1="100" x2={px} y2={py} className={faint} strokeWidth="1.2" />
      <line x1="100" y1="100" x2={px} y2="100" className={`${stroke} draw`} strokeWidth="1.8" pathLength={1} />
      <line x1={px} y1="100" x2={px} y2={py} className={stroke} strokeWidth="1.8" strokeDasharray="3 3" />
      <circle cx={px} cy={py} r="6" className="fill-[var(--color-accent)]" />
      <text x="120" y="116" className="fill-[var(--theme-muted)] text-[9px]">x</text>
      <text x={px + 6} y="86" className="fill-[var(--theme-muted)] text-[9px]">y</text>
    </svg>
  );
}

function Joints() {
  // Side view: shoulder, elbow, wrist, with the two equal 120 mm links.
  return (
    <svg viewBox="0 0 200 200" className="w-full" aria-hidden>
      <line x1="20" y1="168" x2="190" y2="168" className={faint} strokeWidth="1" />
      <rect x="46" y="140" width="40" height="28" rx="4" className="fill-[var(--theme-line)]" />
      <polyline points="66,136 92,62 158,108" className={`${stroke} draw`} fill="none" strokeWidth="2.2" strokeLinejoin="round" pathLength={1} />
      <line x1="158" y1="108" x2="182" y2="128" className={stroke} strokeWidth="2.2" />
      <path d="M104 72 A16 16 0 0 1 84 76" className={faint} fill="none" strokeWidth="1.2" />
      {[
        [66, 136],
        [92, 62],
        [158, 108],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5.5" className="fill-[var(--theme-bg)] stroke-[var(--theme-fg)]" strokeWidth="1.6" />
      ))}
      <circle cx="184" cy="130" r="5" className="fill-[var(--color-accent)]" />
      <text x="96" y="52" className="fill-[var(--theme-muted)] text-[9px]">q₃</text>
    </svg>
  );
}

const STEPS = [
  {
    label: "Polar",
    math: `(θ, r) = (${THETA}°, ${R} mm)`,
    note: "Each spot on the tray is an angle and a distance from the base. Glasses: position 2, 30°.",
    Art: Polar,
  },
  {
    label: "Rectangular",
    math: `x = r cos θ = ${X},  y = r sin θ = ${Y}`,
    note: "Convert to rectangular components: a point the arm can aim its gripper at.",
    Art: Rect,
  },
  {
    label: "Joint angles",
    math: "cos q₃ = (d² − L₁² − L₂²) / (2 L₁ L₂)",
    note: "Solve the two 120 mm links for the shoulder and elbow, then level the gripper with the wrist.",
    Art: Joints,
  },
];

export function MathSection() {
  return (
    <section data-theme="night" data-angle="150" className="relative px-6 pt-[14svh] pb-[24svh]">
      <div className="mx-auto max-w-[1180px]">
        <Reveal className="flex flex-wrap items-center gap-3">
          <SectionLabel angle={150}>The math</SectionLabel>
          <span className="rounded-full border border-[var(--theme-line)] px-3 py-1 text-[11px] tracking-[0.14em] text-[var(--color-sky)] uppercase">
            In development
          </span>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="mt-5 max-w-[860px] text-[clamp(36px,4.4vw,68px)] leading-[0.98] font-[380] tracking-[-0.045em]">
            From a spot on the tray to four joint angles.
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="mt-5 max-w-[620px] text-[17px] leading-[1.45] text-[var(--theme-muted)]">
            On the real arm, this inverse kinematics is still being built. On this page it is already running: every
            move you watched above was solved this way, frame by frame.
          </p>
        </Reveal>

        <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map(({ label, math, note, Art }, i) => (
            <Reveal as="li" key={label} delay={i + 2} className="border-t border-[var(--theme-line)] pt-5">
              <p className="font-mono text-[12px] text-[var(--theme-muted)]">
                0{i + 1} · {label}
              </p>
              <div className="mx-auto mt-4 max-w-[260px]">
                <Art />
              </div>
              <p className="mt-4 font-serif text-[clamp(18px,1.5vw,21px)] leading-[1.3]">{math}</p>
              <p className="mt-2 text-[15.5px] leading-[1.45] text-[var(--theme-muted)]">{note}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
