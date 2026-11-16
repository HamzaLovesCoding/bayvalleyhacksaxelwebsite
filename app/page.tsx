import { ThemeScroll } from "@/components/motion/theme-scroll";
import { Close } from "@/components/sections/close";
import { Hero } from "@/components/sections/hero";
import { MathSection } from "@/components/sections/math";
import { Nav } from "@/components/sections/nav";
import { Problem } from "@/components/sections/problem";
import { Ordinary } from "@/components/sections/ordinary";
import { Rebuild } from "@/components/sections/rebuild";
import { Story } from "@/components/sections/story";
import { TheArm } from "@/components/sections/the-arm";
import { PresenterKeys } from "@/components/presenter-keys";
import { StoryStage } from "@/components/story-stage";

// Acts alternate light and dark; theme-scroll blends the page colours across each boundary.
export default function Home() {
  return (
    <>
      <ThemeScroll />
      <PresenterKeys />
      <Nav />
      <StoryStage>
        <main className="overflow-x-clip">
          <Hero />
          <Problem />
          <Ordinary />
          <Story />
          <TheArm />
          <MathSection />
          <Rebuild />
        </main>
        <Close />
      </StoryStage>
    </>
  );
}
