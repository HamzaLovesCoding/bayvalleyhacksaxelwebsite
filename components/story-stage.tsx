"use client";

import { createContext, type ReactNode, type RefObject, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ArmStage, type Stage } from "@/components/arm-stage";
import { type ProgressMode, track } from "@/lib/scroll";

// One WebGL canvas, fixed behind the page, shared by every section that shows the arm.
// A section registers an "act": while its element holds the middle of the viewport, the act directs
// the stage (camera, pose, highlights) from that section's scroll progress. Between acts the canvas fades out.

type Direct = (stage: Stage, p: number) => void;
type Act = { el: HTMLElement; direct: Direct; leave?: () => void; p: number };

type Ctx = {
  register(el: HTMLElement, mode: ProgressMode, direct: Direct, leave?: () => void): () => void;
  stage: Stage | null;
};
const StoryContext = createContext<Ctx | null>(null);

export function StoryStage({ children }: { children: ReactNode }) {
  const acts = useRef(new Set<Act>());
  const stageRef = useRef<Stage | null>(null);
  const [stage, setStage] = useState<Stage | null>(null);
  const [visible, setVisible] = useState(false);
  const current = useRef<Act | null>(null);

  const pick = useCallback(() => {
    const mid = window.innerHeight / 2;
    let next: Act | null = null;
    for (const a of acts.current) {
      const r = a.el.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) next = a;
    }
    if (current.current !== next) current.current?.leave?.();
    current.current = next;
    setVisible(!!next);
    const s = stageRef.current;
    if (next && s) {
      next.direct(s, next.p);
      s.invalidate();
    }
  }, []);

  const register = useCallback(
    (el: HTMLElement, mode: ProgressMode, direct: Direct, leave?: () => void) => {
      const act: Act = { el, direct, leave, p: 0 };
      acts.current.add(act);
      const stop = track(el, mode, (p) => {
        act.p = p;
        if (current.current !== act || !stageRef.current) return pick();
        act.direct(stageRef.current, p);
        stageRef.current.invalidate();
      });
      pick();
      return () => {
        stop();
        acts.current.delete(act);
        if (current.current === act) pick();
      };
    },
    [pick],
  );

  useEffect(() => {
    const onScroll = () => pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pick]);

  // Stable unless the stage itself changes, so acts don't re-register when visibility toggles.
  const value = useMemo(() => ({ register, stage }), [register, stage]);

  return (
    <StoryContext.Provider value={value}>
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 z-0 transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
      >
        <ArmStage
          withTray
          className="size-full"
          onReady={(s) => {
            stageRef.current = s;
            setStage(s);
            pick();
          }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </StoryContext.Provider>
  );
}

/**
 * Direct the shared 3D stage while `ref`'s element holds the middle of the screen.
 * `leave` runs when another act (or none) takes over.
 */
export function useStoryAct(ref: RefObject<HTMLElement | null>, direct: Direct, mode: ProgressMode = "pin", leave?: () => void) {
  const ctx = useContext(StoryContext);
  const fn = useRef({ direct, leave });
  useEffect(() => {
    fn.current = { direct, leave };
  });
  useEffect(() => {
    if (!ctx || !ref.current) return;
    return ctx.register(
      ref.current,
      mode,
      (s, p) => fn.current.direct(s, p),
      () => fn.current.leave?.(),
    );
  }, [ctx, ref, mode]);
  return ctx?.stage ?? null;
}
