"use client";

import { motion } from "framer-motion";

/**
 * Fades + lifts its children into view on scroll, once.
 *
 * Restrained by design: a short translate and fade, no bounce. `delay` lets you
 * stagger siblings (e.g. cards in a row). Honors prefers-reduced-motion via the
 * global CSS reset in globals.css, which zeroes transition/animation durations.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "span";
}) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
    >
      {children}
    </MotionTag>
  );
}
