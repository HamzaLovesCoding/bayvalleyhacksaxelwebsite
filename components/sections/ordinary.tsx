import { RevealWords } from "@/components/motion/reveal";
import { ScrollScene } from "@/components/motion/scroll-scene";
import { ScrubText } from "@/components/motion/scrub-text";
import { SectionLabel } from "@/components/ui/section-label";

// The hackathon theme, in the team's words: people with arthritis are capable, and it's the reach, the grip and the
// lift that stop them. Axel elevates something ordinary they can still do (saying a sentence) into the task itself.
const STATEMENT =
  "The reach, the grip and the lift are the hard part. With Axel, one ordinary sentence does all three, and the rest of the day stays yours.";

// Mirrors the problem section: same pinned statement, answered in the light.
export function Ordinary() {
  return (
    <section id="ordinary" data-theme="light" data-angle="60" className="relative">
      <ScrollScene length={190} beats={[0.85]} stageClassName="flex flex-col items-center justify-center px-6 text-center">
        <SectionLabel angle={60}>The theme</SectionLabel>
        <h2 className="mt-6 text-[clamp(46px,7.4vw,118px)] leading-[0.92] font-[380] tracking-[-0.045em]">
          <RevealWords text="Elevating" />
          <br />
          <RevealWords text="the ordinary." delay={1} />
        </h2>
        <p className="mt-9 max-w-[900px] text-[clamp(22px,2.4vw,36px)] leading-[1.22] font-[350] tracking-[-0.025em]">
          <ScrubText from={0.12} to={0.72} text={STATEMENT} />
        </p>
      </ScrollScene>
    </section>
  );
}
