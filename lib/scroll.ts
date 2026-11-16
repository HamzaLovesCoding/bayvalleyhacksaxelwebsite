// One requestAnimationFrame loop drives every scroll-linked effect on the page.
// Each tracked element gets a progress value (0..1) that is eased toward the real scroll position,
// so wheel steps glide instead of jumping, without hijacking the scroll itself.
// Progress is written to the element as the CSS variable --p (no React re-render per frame),
// and optionally handed to a callback for things CSS can't express (three.js poses).

export type ProgressMode =
  /** 0 when the element's top reaches the top of the viewport, 1 when its bottom reaches the bottom. Use for tall sections with a sticky child. */
  | "pin"
  /** 0 when the element's top enters the bottom of the viewport, 1 when its bottom leaves the top. */
  | "through"
  /** 0 when the element's top enters the bottom of the viewport, 1 when its top reaches the top. */
  | "enter";

type Track = {
  el: HTMLElement;
  mode: ProgressMode;
  onUpdate?: (p: number) => void;
  top: number;
  height: number;
  target: number;
  value: number;
  written: number;
};

const tracks = new Set<Track>();
let raf = 0;
let last = 0;
let listening = false;
let reduced = false;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

function measure() {
  const y = window.scrollY;
  for (const t of tracks) {
    const r = t.el.getBoundingClientRect();
    t.top = r.top + y;
    t.height = r.height;
  }
}

function targetFor(t: Track, y: number, vh: number) {
  if (t.mode === "pin") return clamp01((y - t.top) / Math.max(t.height - vh, 1));
  if (t.mode === "enter") return clamp01((y + vh - t.top) / vh);
  return clamp01((y + vh - t.top) / (t.height + vh));
}

function frame(now: number) {
  raf = 0;
  const dt = Math.min((now - (last || now)) / 1000, 0.1);
  last = now;
  const y = window.scrollY;
  const vh = window.innerHeight;
  // Framerate-independent easing: ~90% of the way in 0.25s.
  const k = reduced ? 1 : 1 - Math.exp(-dt * 9);
  let moving = false;
  for (const t of tracks) {
    t.target = targetFor(t, y, vh);
    const d = t.target - t.value;
    // Ease small moves; snap big jumps (anchor links, presenter keys) and the ends, so seams never lag behind.
    t.value = Math.abs(d) < 0.0004 || Math.abs(d) > 0.25 || t.target === 0 || t.target === 1 ? t.target : t.value + d * k;
    if (t.value !== t.target) moving = true;
    if (t.value !== t.written) {
      t.written = t.value;
      t.el.style.setProperty("--p", t.value.toFixed(4));
      t.onUpdate?.(t.value);
    }
  }
  if (moving) kick();
  else last = 0;
}

function kick() {
  if (!raf) raf = requestAnimationFrame(frame);
}

function onResize() {
  measure();
  kick();
}

function listen() {
  if (listening) return;
  listening = true;
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  reduced = mq.matches;
  mq.addEventListener("change", (e) => (reduced = e.matches));
  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", onResize);
  // Content above a tracked element can change height (fonts, images, the 3D canvas): re-measure.
  new ResizeObserver(onResize).observe(document.body);
}

/** Start tracking an element. Returns a function that stops tracking it. */
export function track(el: HTMLElement, mode: ProgressMode, onUpdate?: (p: number) => void) {
  listen();
  const t: Track = { el, mode, onUpdate, top: 0, height: 0, target: 0, value: 0, written: -1 };
  tracks.add(t);
  measure();
  // Start where the page already is (e.g. reload halfway down) instead of animating from 0.
  t.value = t.target = targetFor(t, window.scrollY, window.innerHeight);
  kick();
  return () => {
    tracks.delete(t);
  };
}

/** Maps p from [a, b] to [0, 1], clamped. */
export const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

/** Smooth in-out curve for 0..1 values. */
export const ease = (t: number) => t * t * (3 - 2 * t);

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
