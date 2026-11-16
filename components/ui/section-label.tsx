/**
 * Sections are numbered like spots on the tray: 000°, 030°, 060°… and finally 270°, where the arm hands
 * things to you. The nav's dial reads these from data-angle on each section.
 */
export function SectionLabel({ angle, children, className = "" }: { angle: number; children: string; className?: string }) {
  return (
    <p className={`flex items-baseline gap-4 text-[12px] font-medium tracking-[0.14em] text-[var(--theme-muted)] uppercase ${className}`}>
      <span className="font-mono tracking-normal text-[var(--color-accent)] tabular-nums">{String(angle).padStart(3, "0")}°</span>
      <span>{children}</span>
    </p>
  );
}
