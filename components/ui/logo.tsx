/** Three joints and two links: a stand-in mark until the team has its own. */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 32" className={className} fill="none" aria-hidden>
      <path d="M6 27 15 9l18 1" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6" cy="27" r="5" fill="currentColor" />
      <circle cx="15" cy="9" r="5" fill="currentColor" />
      <circle cx="33" cy="10" r="5" fill="currentColor" />
    </svg>
  );
}
