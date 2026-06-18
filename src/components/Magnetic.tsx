"use client";

import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

/**
 * Wraps a child so it's gently "pulled" toward the cursor while hovered, then
 * springs back on leave. Used on primary CTAs. No-op for reduced motion.
 */
export function Magnetic({
  children,
  strength = 0.5,
  className = "",
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // Lower stiffness + damping = a livelier, slightly elastic pull and snap-back.
  const config = { stiffness: 180, damping: 12, mass: 0.3 };
  const sx = useSpring(x, config);
  const sy = useSpring(y, config);

  if (reduce) {
    return <span className={className}>{children}</span>;
  }

  function handleMove(e: React.MouseEvent<HTMLSpanElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.span
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy, display: "inline-block" }}
      className={className}
    >
      {children}
    </motion.span>
  );
}
