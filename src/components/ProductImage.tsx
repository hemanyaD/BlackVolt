import { Bolt } from "@/components/Logo";

/**
 * Placeholder product visual — a solid charcoal/gold block stamped with the SKU
 * name and a bolt watermark. Lets the whole site look intentional before real
 * photography exists. Swap this component's body for a <next/image> later.
 */
export function ProductImage({
  name,
  placeholder,
  className = "",
}: {
  name: string;
  placeholder: "gold" | "charcoal";
  className?: string;
}) {
  const isGold = placeholder === "gold";
  const surface = isGold
    ? "bg-gold text-charcoal"
    : "bg-charcoal text-cream";

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${surface} ${className}`}
      role="img"
      aria-label={`${name} bottle`}
    >
      {/* Oversized bolt watermark for texture. */}
      <Bolt
        className={`absolute -right-6 -bottom-8 h-48 w-48 rotate-12 ${
          isGold ? "text-charcoal/10" : "text-gold/15"
        }`}
      />
      <span className="relative px-6 text-center font-display text-2xl font-black uppercase leading-tight tracking-tight">
        {name}
      </span>
    </div>
  );
}
