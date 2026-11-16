import Link from "next/link";
import type { ReactNode } from "react";

type PillButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "solid" | "outline";
  /** The small teal status dot used on primary calls to action. */
  dot?: boolean;
  className?: string;
};

// Colours come from the section theme (theme-scroll.tsx), so buttons read correctly on light and dark acts.
export function PillButton({ href, children, variant = "outline", dot = false, className = "" }: PillButtonProps) {
  const look =
    variant === "solid"
      ? "border-[var(--theme-fg,#1a1718)] bg-[var(--theme-fg,#1a1718)] text-[var(--theme-bg,#fafafa)] hover:opacity-85"
      : "border-[var(--theme-fg,#1a1718)]/35 hover:border-[var(--theme-fg,#1a1718)] hover:bg-[var(--theme-fg,#1a1718)] hover:text-[var(--theme-bg,#fafafa)]";

  return (
    <Link
      href={href}
      className={`inline-flex h-[44px] items-center gap-[10px] rounded-full border px-[20px] text-[16px] leading-none tracking-[-0.01em] transition-[color,background-color,border-color,opacity] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${look} ${className}`}
    >
      {children}
      {dot && <span aria-hidden className="size-[6px] rounded-full bg-teal" />}
    </Link>
  );
}
