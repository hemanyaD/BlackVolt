"use client";

import { motion, useReducedMotion } from "framer-motion";
import { colors } from "@/lib/theme";

// Fixed (not random) layout so server and client markup match — no hydration
// mismatch. Each bean drifts vertically and rotates on its own gentle loop.
const beans = [
  { left: "6%", top: "22%", size: 26, dur: 9, delay: 0, rot: -18 },
  { left: "18%", top: "68%", size: 18, dur: 11, delay: 1.5, rot: 24 },
  { left: "33%", top: "38%", size: 14, dur: 8, delay: 0.6, rot: -8 },
  { left: "47%", top: "78%", size: 20, dur: 12, delay: 2.2, rot: 14 },
  { left: "62%", top: "30%", size: 16, dur: 10, delay: 1, rot: -28 },
  { left: "78%", top: "60%", size: 24, dur: 13, delay: 0.3, rot: 10 },
  { left: "88%", top: "26%", size: 14, dur: 9.5, delay: 1.8, rot: -16 },
];

/** Drifting coffee-bean particle field for section backgrounds. */
export function BeanField({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {beans.map((b, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: b.left, top: b.top }}
          animate={
            reduce ? undefined : { y: [0, -26, 0], rotate: [b.rot, b.rot + 14, b.rot] }
          }
          transition={{
            duration: b.dur,
            repeat: Infinity,
            ease: "easeInOut",
            delay: b.delay,
          }}
        >
          <svg width={b.size} height={b.size * 1.3} viewBox="0 0 20 26">
            <ellipse
              cx="10"
              cy="13"
              rx="8"
              ry="11"
              fill={colors.gold}
              opacity="0.18"
            />
            <path
              d="M10 4 Q13 13 10 22"
              fill="none"
              stroke={colors.gold}
              strokeWidth="1.4"
              opacity="0.25"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
