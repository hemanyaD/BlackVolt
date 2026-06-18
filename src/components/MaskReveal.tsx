"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

/**
 * Wipes its (single-line) text up into view from behind a mask when scrolled
 * into view. Wrap heading text: <h2 ...><MaskReveal>Headline</MaskReveal></h2>.
 *
 * The intersection is observed on the OUTER (untransformed) wrapper and the
 * inner span is animated off that boolean — observing the transformed/clipped
 * element directly made the reveal unreliable (headings could stay hidden).
 * Reduced-motion users get the text immediately.
 */
export function MaskReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();

  if (reduce) {
    return <span className={`block ${className}`}>{children}</span>;
  }

  return (
    <span
      ref={ref}
      className={`block overflow-hidden pb-[0.06em] ${className}`}
    >
      <motion.span
        className="block"
        initial={{ y: "110%" }}
        animate={inView ? { y: 0 } : { y: "110%" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}
