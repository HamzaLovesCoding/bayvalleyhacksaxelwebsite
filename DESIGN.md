# Axel Design System

Source of truth: the scroll-driven landing page in this repo (`app/`, `components/`, `lib/`).
Use this file to build the mobile experience so it feels like the same product.
The arm is called **Axel**. Read the name from `BRAND` in `lib/site.ts`, never hard-code it. It is also the voice wake word ("Axel, bring me my glasses").

Hackathon theme: **Elevating the ordinary**. People with arthritis are capable; the reach, the grip and the lift are what get hard. Axel takes on that part, so one ordinary sentence gets an everyday task done.

---

## 1. Product in one paragraph

An assistive robot arm for people with arthritis. The arm sits in the centre of a circular tray. Everyday items sit around the tray at fixed positions, where position n is at (n − 1) × 30°. For example, glasses in position 2 sit at 30°. The person says "Axel, bring me the ___". An AI model works out which item they mean, and the arm fetches it and hands it over. "Release" opens the gripper. "Put it back" returns the item to its spot. The AI also infers needs from hints, for example "I'm so thirsty" brings the water. Inverse kinematics on the real arm is **in development**.

## 2. Design principles

1. **The tray is the visual system.** The recurring motif is the tray's polar geometry: a ring, a tick every 30°, and one vector showing where the arm points. Sections are numbered by angle (see §6).
2. **Minimal and bold.** Huge type, lots of space and hairline rules. No bordered cards, gradients on text, blobs, marquees or stock icons.
3. **Motion that behaves like a servo.** It eases in and out and settles, with no bounce, spring or wobble. Scroll drives motion; nothing loops on its own except the scroll cue.
4. **Two voices.** Serif (Newsreader) is used only for words a person **says**, such as quoted commands and status lines. Sans (Inter) is used for everything the machine or page says.
5. **Honest copy.** Use only facts listed in §10. Label simulations as simulations. Mark inverse kinematics as "In development".

## 3. Colour

The page colours follow the section on screen. Each section declares `data-theme`, and `components/motion/theme-scroll.tsx` blends the colours into CSS variables on `<html>` as you scroll from one section to the next.

| Theme | `--theme-bg` | `--theme-fg` | `--theme-muted` | `--theme-line` | Used for |
|---|---|---|---|---|---|
| `light` | `#fafafa` | `#1a1718` | `#6f6f74` | `#dde4f3` | Hero, Elevating the ordinary, Build |
| `sky` | `#eaf4fc` | `#162033` | `#5d6b80` | `#c9dcf2` | How it works (story) |
| `night` | `#120f17` | `#f2f0f5` | `#9a95a6` | `#2c2735` | Problem, The arm, The math |
| `signal` | `#46a5d8` | `#0e1218` | `#173247` | `#2f7fac` | Closing section "270° You" |

Fixed tokens, defined in `app/globals.css` `@theme`:
- `--color-accent: #46a5d8`. It means "where the arm is going". Use it for angle numbers, the dial vector, the progress bar, the active tray item and focus rings. Never use it for paragraphs or as a decorative fill.
- `--color-sky: #bee5fa`. Used for stat values on dark backgrounds and for tinted image tiles.
- `--color-teal: #7cc6b8`. Used only for the small status dot on primary buttons.

Rules:
- Always style with `var(--theme-*)` so components work on every theme. Example: `text-[var(--theme-muted)]`, `border-[var(--theme-line)]`.
- On the `signal` theme, all text must be full `--theme-fg` for contrast, never muted.
- Accent alternative: signal orange `#EC4A16` was proposed by the design panel. If it is adopted, swap the accent everywhere, and on light backgrounds use a darker shade (`#B5300C`) for small text.

## 4. Typography

Fonts are loaded in `app/layout.tsx` via `next/font`:
- **Inter**, variable, with the `opsz` axis (`--font-inter`). Use it for all UI and display text.
- **Newsreader 500** (`--font-newsreader`, Tailwind `font-serif`). Use it only for spoken words.

| Role | Size (clamp) | Weight | Tracking | Line height |
|---|---|---|---|---|
| Display (hero H1, close) | `clamp(46px, 7.4vw, 118px)`; close up to 168px | 380–400 | −0.045 to −0.055em | 0.88–0.92 |
| H2 section title | `clamp(40px, 5vw, 76px)` | 380 | −0.045em | 0.95 |
| Big statement (scrub text) | `clamp(32px, 4.7vw, 74px)` | 350 | −0.035em | 1.06 |
| Stat numerals | `clamp(44px, 7vw, 104px)` | 300 | −0.05em | 1, tabular-nums |
| Step / part title | `clamp(26px, 2.6vw, 40px)` | 380, or serif if spoken | −0.03em | 1.05 |
| Spoken line / status | 22px serif | 500 | — | 1.25 |
| Body | 16–17px (hero sub up to 19px) | 400 | — | 1.4–1.45 |
| Data / spec rows | 15–16px | 400 | — | tabular-nums |
| Section label | 12px uppercase, +0.14em, weight 500 | 500 | — | — |
| Mono (angles, indexes) | 11–13px `font-mono` | — | normal | tabular-nums |

Body text should be at most about 540px wide. Units in numbers (mm) are set at 0.32em in muted colour, next to the number.

## 5. Layout & spacing

- Content max width is **1180px**, with side padding of 24px on mobile and up to 6vw on desktop.
- Section rhythm uses viewport units: top padding about 14–18svh, bottom padding about 16–24svh.
- Layouts are left-aligned and asymmetric. Only the hero and the problem statement are centred.
- Rules are 1px `--theme-line` lines. Stat blocks use a top rule (`border-t`) instead of boxes.
- Corner radius: pills are fully rounded; image tiles are 22px; the mobile console card is 28px.
- Use `svh` units for anything full-height on mobile, so the address bar doesn't cause jumps.

## 6. Signature motif: angles & the dial

- **Section labels** use `<SectionLabel angle={n}>Title</SectionLabel>` from `components/ui/section-label.tsx`. The 3-digit angle is in the accent colour, followed by an uppercase title.
  - Sections: `000° Assistive robotics for arthritis`, `030° The problem`, `060° The theme` (Elevating the ordinary), `090° How it works`, `120° The arm`, `150° The math`, `180° The build`, `270° You`.
  - Each section element carries `data-angle="<n>"`.
- **TrayDial** (`components/ui/tray-dial.tsx`) is a 24-unit SVG: a ring, 12 ticks, longer ticks at 0–180° and at 270°, and an accent vector that rotates with a 420ms servo ease. 0° is at 3 o'clock, and angles increase counter-clockwise.
- **Nav readout:** the dial plus a mono angle readout (e.g. `060°`). The readout counts through every degree when the section changes.

## 7. Components

| Component | File | Notes |
|---|---|---|
| `PillButton` | `components/ui/button.tsx` | 44px tall, 16px text, `solid` / `outline` variants; theme-aware; optional teal `dot` |
| Nav | `components/sections/nav.tsx` | Fixed. A 2px accent progress line at the top, then 42px pills (logo, section index, dial readout). Pill background is theme bg at 80% with `backdrop-blur-md`; keep blur to small areas only. |
| `SectionLabel` | `components/ui/section-label.tsx` | See §6 |
| `TrayDial` | `components/ui/tray-dial.tsx` | See §6 |
| `LogoMark` | `components/ui/logo.tsx` | Placeholder mark: three joints and two links |

## 8. Motion system

Primitives live in `lib/scroll.ts` and `components/motion/`. Reuse them; don't add an animation library.

- **Scroll engine** (`lib/scroll.ts`): one requestAnimationFrame loop writes `--p` (0..1) to each tracked element. It is smoothed (about 0.25s) and snaps on jumps larger than 0.25. Modes:
  - `pin`: for tall sections with a sticky stage.
  - `through`: from entering the bottom of the viewport to leaving the top.
  - `enter`: from entering to reaching the top.
  - Helpers: `range(p, a, b)` and `ease(t)`.
- `ScrollScene` (`components/motion/scroll-scene.tsx`): a tall section (`length` in svh) with a sticky full-height stage. Children read `var(--p)` in CSS.
- `Reveal` / `RevealWords` (`reveal.tsx`): rise and fade in once on first view; words slide up out of a mask with a 55ms stagger.
- `ScrubText` (`scrub-text.tsx`): words light up from 16% opacity to 100% as `--p` moves from `from` to `to`.
- `CountUp` (`count-up.tsx`): counts up with an ease-out over 1.4s; screen readers get the final value.

Easing tokens (in `globals.css`):
- `--ease-glide: cubic-bezier(0.16, 1, 0.3, 1)` for things arriving.
- `--ease-servo: cubic-bezier(0.65, 0, 0.35, 1)` for mechanical moves (dial, arm).

Durations:
- Hover: about 200ms.
- Dial step: 420ms.
- Reveal: 900–1100ms.
- Step text swap: 600–700ms.

Never use blur, parallax on text, bounces or infinite loops.

**Reduced motion:** reveals show immediately, scrub text is fully lit, counters show their final value and progress isn't smoothed. Every section must stay readable without scrolling effects.

## 9. 3D stage (the arm)

- `components/story-stage.tsx` provides **one** fixed WebGL canvas behind the whole page.
  - Sections direct it with `useStoryAct(ref, (stage, p) => {...}, mode, onLeave)`. The act whose element holds the middle of the screen is in control.
  - The canvas fades out when no act is active.
- `components/arm-stage.tsx` (`Stage`):
  - `look({ az, el, dist, target, shift })` positions the camera. `shift` slides the subject across the frame, e.g. `[0.2, 0]` puts the arm on the right for a two-column layout.
  - `invalidate()`: the stage renders only when something changes.
  - `animate(tick)` runs time-based motion.
  - Pixel ratio is capped at 1.5.
- Arm and tray code lives in `lib/arm/`:
  - `rig.ts`: the GLB rig. `setPose`, `gripWorld`, `highlight(parts)` (ghosts all other parts with a depth pre-pass).
  - `ik.ts`: `solve(angle, distance, height, pitch, back)` turns a polar tray spot into joint angles. `back` folds the arm over its base, because the base only travels about 0–180°.
  - `choreo.ts`: task-space keyframes. Sections: `fetchKeys`, `releaseKeys`, `returnKeys`, `READY`, `HANDOFF`.
  - `demo.ts`: `showPhase` (pure, used by the scroll story) and `ArmDemo` (runs typed commands).
  - `tray.ts` / `items.ts`: the tray and its 7 items (keys, glasses, water, pills, phone, remote, book). The active item is tinted with the accent colour.
- Static renders with transparent backgrounds are in `public/arm/*.png`:
  - full, reach, grip, wrist, upper, fore, base, servos.
  - Use them as posters and fallbacks.
  - **Mobile recommendation:** consider these PNGs, plus the TrayDial as an SVG diagram, instead of WebGL on low-end phones.
- The page has no interactive assistant demo: the team runs a physical demo live and has its own mobile app. The arm on the page is scroll-driven only.

## 10. Content & facts (use only these)

- **Impact** (CDC, MMWR 2021, NHIS 2016–2018; link `https://www.cdc.gov/mmwr/volumes/70/wr/mm7040a2.htm`). Always show the source next to the numbers.
  - 58.5M U.S. adults have arthritis.
  - 25.7M are limited in everyday activities by it.
  - 1 in 2 adults aged 65 and older have arthritis.
- **Hardware** (from the CAD):
  - 103 components.
  - 5 × MG996R metal-gear servos: 4 axes plus a gripper.
  - Two 120 mm links; about 118 mm from wrist to jaw tip; about 360 mm theoretical reach.
  - Ø110 mm base; about 202 mm tall when stowed; shoulder axis about 95 mm up.
  - Rack-and-pinion parallel gripper with ridged pads.
  - Camera mount on the wrist.
  - Turntable on 8 × 623 V-groove bearings.
  - 50 screws (M2.5–M5), 8 M3 nuts, 6 magnets (Ø6 × 3 mm), 6 wire clips.
- **Unknown, never invent:** payload, speed, price, controller, which AI or speech model, team names, whether parts are 3D-printed (say "custom parts" instead).
- **Voice commands:** "Axel, bring me the ___" · "Release" · "Put it back".
- **Headlines in use:**
  - Hero: "Ask for it. Axel hands it over."
  - Close: "Help, within reach."
  - The theme: "Elevating the ordinary."
  - The arm: "Built joint by joint."
  - Build: "Built to be rebuilt." (the spec tables were cut: too much to read out in a 3-minute pitch)

## 11. Accessibility

- Text contrast is at least 4.5:1, and UI borders at least 3:1.
- Focus: `outline-2 outline-offset-2` in the accent colour.
- Animated numbers render as `aria-hidden` text plus an `sr-only` final value.
- The 3D canvas is `aria-hidden`; the same information is always in the DOM as text.
- Status lines use `aria-live="polite"`.
- Touch targets are at least 44px.
- Presenter keys (PageDown/PageUp and the arrow keys jump between beats) are ignored while focus is in an input.

## 12. Mobile guidance (for the next build)

- Same section order and angle labels. Layouts are stacked: text at the top, the visual below.
  - On mobile the story shows only the **active** step.
- Shorten the pinned sections (aim for about 60–70% of the desktop `svh` lengths).
- Put the Try-it console on a solid card (`bg-[var(--theme-bg)]`, 28px radius, 1px line border) so the 3D arm never shows behind the text.
- Prefer the PNG renders and the SVG dial if WebGL performance is poor. Keep at most one canvas.
- Test at 390×844, on a real iPhone (Safari: `svh` and sticky positioning), and with reduced motion on.
