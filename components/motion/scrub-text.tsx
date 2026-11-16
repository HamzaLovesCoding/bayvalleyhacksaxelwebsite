/**
 * Words that light up one after another as an ancestor's --p goes from `from` to `to`.
 * Needs an ancestor tracked by useScrollProgress / ScrollScene. Fully lit with reduced motion.
 */
export function ScrubText({ text, from = 0, to = 1, className = "" }: { text: string; from?: number; to?: number; className?: string }) {
  const words = text.split(" ");
  return (
    <span className={className} style={{ "--from": from, "--span": to - from }}>
      {words.map((w, i) => (
        <span key={i} className="scrub-word" style={{ "--i": i / words.length }}>
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
