"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Infinite horizontal marquee band. The phrase is duplicated and the track
 * scrolls by exactly 50% so the loop is seamless. Pauses (renders static) for
 * reduced-motion users.
 */
export function Marquee({
  items,
  className = "",
}: {
  items: string[];
  className?: string;
}) {
  const reduce = useReducedMotion();
  const sequence = [...items, ...items];

  return (
    <div
      className={`overflow-hidden bg-gold py-3 text-charcoal ${className}`}
      aria-hidden="true"
    >
      <motion.div
        className="flex w-max gap-8 whitespace-nowrap pr-8"
        animate={reduce ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        {sequence.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-8 font-display text-sm font-black uppercase tracking-[0.2em]"
          >
            {item}
            <span className="text-charcoal/50">⚡</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
