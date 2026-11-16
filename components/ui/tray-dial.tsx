/** Top-down tray: a ring with a tick every 30° (positions 1–7 run 0°–180°, the hand-off sits at 270°). */
export function TrayDial({ angle, className = "" }: { angle: number; className?: string }) {
  const ticks = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <svg viewBox="-12 -12 24 24" className={className} aria-hidden>
      <circle r="9.5" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
      {ticks.map((a) => {
        const r = (a * Math.PI) / 180;
        const long = a <= 180 || a === 270;
        // Rounded: server and browser Math can differ in the last digit, which breaks hydration.
        const at = (v: number) => Math.round(v * 1000) / 1000;
        return (
          <line
            key={a}
            x1={at(Math.cos(r) * (long ? 7 : 8.2))}
            y1={at(-Math.sin(r) * (long ? 7 : 8.2))}
            x2={at(Math.cos(r) * 9.5)}
            y2={at(-Math.sin(r) * 9.5)}
            stroke="currentColor"
            strokeOpacity={long ? 0.7 : 0.3}
            strokeWidth="1"
          />
        );
      })}
      <g className="transition-transform duration-[420ms] ease-[cubic-bezier(0.65,0,0.35,1)]" style={{ transform: `rotate(${-angle}deg)` }}>
        <line x1="0" y1="0" x2="8" y2="0" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="butt" />
      </g>
      <circle r="2.4" fill="currentColor" />
    </svg>
  );
}
