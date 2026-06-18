"use client";

import { motion, useReducedMotion } from "framer-motion";

/*
  A wall of large display-type marquee rows scrolling in alternating directions,
  mixing filled and outlined text — a bold typographic statement band. Each row
  duplicates its content and translates by exactly 50% for a seamless loop.
  Static for reduced motion.
*/

type Variant = "cream" | "gold" | "outlineGold" | "outlineCream";

const variantClass: Record<Variant, string> = {
  cream: "text-cream",
  gold: "text-gold",
  outlineGold: "text-transparent [-webkit-text-stroke:2px_#C9A24B]",
  outlineCream: "text-transparent [-webkit-text-stroke:1.5px_#ECE9E1]",
};

const rows: {
  text: string;
  variant: Variant;
  dir: "left" | "right";
  duration: number;
}[] = [
  { text: "A jolt in every drop", variant: "cream", dir: "left", duration: 26 },
  { text: "The boldest concentrate", variant: "outlineGold", dir: "right", duration: 32 },
  { text: "Estate-direct · Café-grade · 15–20 cups", variant: "gold", dir: "left", duration: 30 },
  { text: "Pour · Add · Jolt", variant: "outlineCream", dir: "right", duration: 24 },
  { text: "Brewed in India", variant: "cream", dir: "left", duration: 34 },
];

function Row({
  text,
  variant,
  dir,
  duration,
}: {
  text: string;
  variant: Variant;
  dir: "left" | "right";
  duration: number;
}) {
  const reduce = useReducedMotion();
  // Each copy repeats the phrase a few times so it fills wide screens.
  const copy = (
    <span className="flex shrink-0 items-center">
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className="flex items-center">
          {text}
          <span className="px-6 text-gold/70">⚡</span>
        </span>
      ))}
    </span>
  );

  return (
    <div className="overflow-hidden">
      <motion.div
        className={`flex w-max whitespace-nowrap font-display text-5xl font-black uppercase leading-[1.05] tracking-tight sm:text-7xl ${variantClass[variant]}`}
        animate={
          reduce
            ? undefined
            : { x: dir === "left" ? ["0%", "-50%"] : ["-50%", "0%"] }
        }
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {copy}
        {copy}
      </motion.div>
    </div>
  );
}

export function MarqueeWall() {
  return (
    <section className="overflow-hidden bg-charcoal py-16 sm:py-20">
      <div className="flex flex-col gap-2 sm:gap-3">
        {rows.map((row) => (
          <Row key={row.text} {...row} />
        ))}
      </div>
    </section>
  );
}
