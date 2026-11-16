import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { ScrollScene } from "@/components/motion/scroll-scene";
import { ScrubText } from "@/components/motion/scrub-text";
import { SectionLabel } from "@/components/ui/section-label";

// CDC, MMWR 70(40), 2021: National Health Interview Survey, 2016–2018.
const SOURCE = "https://www.cdc.gov/mmwr/volumes/70/wr/mm7040a2.htm";

export function Problem() {
  return (
    <section id="impact" data-theme="night" data-angle="30" className="relative">
      <ScrollScene length={200} beats={[0.8]} stageClassName="flex flex-col items-center justify-center gap-10 px-6">
        <SectionLabel angle={30}>The problem</SectionLabel>
        <p className="max-w-[1120px] text-center text-[clamp(32px,4.7vw,74px)] leading-[1.06] font-[350] tracking-[-0.035em]">
          <ScrubText
            from={0.06}
            to={0.72}
            text="For 58.5 million American adults with arthritis, reaching for glasses, a glass of water or the day’s pills can hurt. Many times a day."
          />
        </p>
      </ScrollScene>

      <div data-beat className="mx-auto grid max-w-[1180px] gap-14 px-6 pt-[14svh] pb-[38svh] md:grid-cols-3 md:gap-8">
        {[
          { node: <CountUp value={58.5} decimals={1} suffix="M" />, label: "U.S. adults have arthritis" },
          { node: <CountUp value={25.7} decimals={1} suffix="M" />, label: "of them are limited in everyday activities by it" },
          { node: "1 in 2", label: "adults aged 65 and older have arthritis" },
        ].map((s, i) => (
          <Reveal key={s.label} delay={i} className="border-t border-[var(--theme-line)] pt-6">
            <p className="text-[clamp(56px,7vw,104px)] leading-none font-[300] tracking-[-0.05em]">{s.node}</p>
            <p className="mt-4 max-w-[280px] text-[17px] leading-[1.35] text-[var(--theme-muted)]">{s.label}</p>
          </Reveal>
        ))}
        <Reveal delay={3} className="text-[13px] text-[var(--theme-muted)] md:col-span-3">
          Source:{" "}
          <a href={SOURCE} target="_blank" rel="noreferrer" className="underline decoration-[var(--theme-line)] underline-offset-4 hover:text-[var(--theme-fg)]">
            CDC, Morbidity and Mortality Weekly Report, 2021 (2016–2018 data)
          </a>
        </Reveal>
      </div>
    </section>
  );
}
