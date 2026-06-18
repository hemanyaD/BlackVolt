import Link from "next/link";
import { colors } from "@/lib/theme";

/**
 * BlackVolt wordmark: "BLACK" + lightning bolt + "VOLT".
 *
 * This component is the single source of truth for the logo in the UI. A
 * standalone `/public/logo.svg` mirrors it for favicons / OG / external use.
 * To rebrand, edit this file and that SVG.
 *
 * `tone` controls contrast:
 *  - "onDark"  (default) — cream "BLACK", for dark backgrounds (e.g. navbar/footer)
 *  - "onLight"           — charcoal "BLACK", for cream/white backgrounds
 */
export function Logo({
  tone = "onDark",
  className = "",
}: {
  tone?: "onDark" | "onLight";
  className?: string;
}) {
  const blackColor = tone === "onDark" ? "text-cream" : "text-charcoal";

  return (
    <Link
      href="/"
      aria-label="BlackVolt home"
      className={`group inline-flex items-center gap-1.5 font-display text-2xl font-black tracking-tight ${className}`}
    >
      <span className={blackColor}>BLACK</span>
      <Bolt className="h-5 w-5 -mx-0.5 text-gold transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6" />
      <span className="text-gold">VOLT</span>
    </Link>
  );
}

/** The lightning-bolt glyph, reused by the wordmark and the circular icon. */
export function Bolt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M13.5 2 4 14h6l-1.5 8L20 9h-6l1.5-7z" />
    </svg>
  );
}

/** Circular placeholder icon (charcoal disc, gold bolt) — swap for a real mark. */
export function LogoIcon({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-charcoal ${className}`}
      style={{ outline: `2px solid ${colors.gold}`, outlineOffset: "-4px" }}
      aria-hidden="true"
    >
      <Bolt className="h-1/2 w-1/2 text-gold" />
    </span>
  );
}
