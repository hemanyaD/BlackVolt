"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * A wavy boundary between two sections. The divider's own background is the
 * section ABOVE (`top`); the wave is filled with the section BELOW (`bottom`),
 * so the lower section appears to wave up into the upper one — seamlessly.
 *
 * The wave is a clean, repeating sine curve that flows sideways in a seamless
 * loop (it's drawn 2× the period wider than the viewport and translated by
 * exactly one period). Static for reduced motion.
 *
 *   <Section tone="cream">…</Section>
 *   <WaveDivider top="#ECE9E1" bottom="#2B2723" />
 *   <Section tone="charcoal">…</Section>
 */

// One smooth period (width 720) repeated to comfortably overflow the 1440
// viewBox; translating by 720 loops seamlessly because the curve is periodic.
const PERIOD = 720;
const wavePath = (() => {
  let d = "M0,60";
  for (let x = 0; x < 2880; x += PERIOD) {
    d +=
      ` C${x + 120},30 ${x + 240},30 ${x + 360},60` +
      ` C${x + 480},90 ${x + 600},90 ${x + PERIOD},60`;
  }
  return `${d} L2880,120 L0,120 Z`;
})();

export function WaveDivider({
  top,
  bottom,
  flip = false,
  speed = 14,
  className = "",
}: {
  top: string;
  bottom: string;
  flip?: boolean;
  speed?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{ background: top, lineHeight: 0 }}
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="block h-10 w-full sm:h-20"
        style={flip ? { transform: "scaleX(-1)" } : undefined}
      >
        {reduce ? (
          <path d={wavePath} fill={bottom} />
        ) : (
          <motion.g
            animate={{ x: [0, -PERIOD] }}
            transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
          >
            <path d={wavePath} fill={bottom} />
          </motion.g>
        )}
      </svg>
    </div>
  );
}
