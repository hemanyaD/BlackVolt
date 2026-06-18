/**
 * Page section wrapper that enforces the site's light/dark rhythm.
 *
 * `tone` sets the background + sensible default text color:
 *  - "cream"    — bone/cream background, charcoal text (default)
 *  - "charcoal" — dark background, cream text
 *  - "bone"     — slightly lighter neutral, for adjacent light sections
 *
 * Content is centered in a max-width container with consistent vertical padding.
 */
const tones = {
  cream: "bg-cream text-charcoal",
  bone: "bg-bone text-charcoal",
  charcoal: "bg-charcoal text-cream",
} as const;

export function Section({
  tone = "cream",
  className = "",
  containerClassName = "",
  id,
  children,
}: {
  tone?: keyof typeof tones;
  className?: string;
  containerClassName?: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`${tones[tone]} ${className}`}>
      <div
        className={`mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24 ${containerClassName}`}
      >
        {children}
      </div>
    </section>
  );
}

/** Small uppercase label that sits above section headings. */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 font-display text-sm font-bold uppercase tracking-[0.2em] text-gold">
      {children}
    </p>
  );
}
