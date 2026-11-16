import Link from "next/link";
import { Reveal, RevealWords } from "@/components/motion/reveal";
import { SectionLabel } from "@/components/ui/section-label";
import { BRAND } from "@/lib/site";

// The whole pitch in three lines, numbered like the sections they come from.
const RECAP = [
  { angle: "030°", label: "The problem", line: "For 58.5 million U.S. adults, reaching can hurt." },
  { angle: "060°", label: "The theme", line: "Elevating the ordinary." },
  { angle: "090°", label: "The answer", line: `Ask, and ${BRAND} hands it over.` },
];

// 270° is where the arm hands things over: the page ends facing you, in the signal colour.
export function Close() {
  return (
    <footer id="contact" data-theme="signal" data-angle="270" className="relative overflow-hidden px-6 pt-[18svh]">
      <div className="mx-auto w-full max-w-[1180px]">
        <Reveal>
          <SectionLabel angle={270} className="[&>span:first-child]:text-[var(--theme-fg)]">
            You
          </SectionLabel>
        </Reveal>
        <h2 className="mt-6 text-[clamp(56px,10vw,168px)] leading-[0.88] font-[400] tracking-[-0.055em]">
          <RevealWords text="Help," />
          <br />
          <RevealWords text="within reach." delay={1} />
        </h2>

        <div className="mt-[9svh] grid gap-x-16 gap-y-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <Reveal delay={2}>
            <p className="max-w-[440px] text-[clamp(18px,1.5vw,22px)] leading-[1.4]">
              {BRAND} does the lifting: it brings what you ask for, lets go when you say “release” and puts it back when you’re
              done.
            </p>
            <Link
              href="#top"
              className="mt-8 inline-flex h-[44px] items-center rounded-full bg-[var(--theme-fg)] px-5 text-[16px] text-[var(--theme-bg)] transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-fg)]"
            >
              Back to 000° ↑
            </Link>
          </Reveal>
          <ol>
            {RECAP.map((r, i) => (
              <Reveal as="li" key={r.angle} delay={i + 2} className="grid grid-cols-[64px_minmax(0,1fr)] gap-x-4 border-t border-[var(--theme-fg)]/30 py-5">
                <span className="pt-[0.3em] font-mono text-[13px] tabular-nums">{r.angle}</span>
                <span>
                  <span className="block text-[12px] font-medium tracking-[0.14em] uppercase">{r.label}</span>
                  <span className="mt-1.5 block text-[clamp(22px,2.2vw,32px)] leading-[1.15] tracking-[-0.025em]">{r.line}</span>
                </span>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>

      {/* The name, set as large as the page allows and cut off by the bottom edge, like the arm standing on the tray. */}
      <div className="mx-auto mt-[14svh] w-full max-w-[1180px]">
        <div className="flex justify-between gap-x-6 gap-y-1 border-t border-[var(--theme-fg)]/30 pt-4 text-[13px] max-md:flex-col">
          <span>© 2026 {BRAND}</span>
          <span>Elevating the ordinary</span>
          <span>Built for people living with arthritis.</span>
        </div>
        <p aria-hidden className="mt-[2svh] -mb-[0.07em] text-[clamp(150px,44vw,640px)] leading-[0.8] font-semibold tracking-[-0.07em] lowercase">
          {BRAND}
        </p>
      </div>
    </footer>
  );
}
