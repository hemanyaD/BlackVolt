"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { colors } from "@/lib/theme";

/**
 * Coffee-bean cursor. A gold bean follows the pointer with a slight spring lag
 * and grows over interactive elements. Only active on fine-pointer (mouse)
 * devices — touch devices keep their normal behaviour and the native cursor.
 */
export function BeanCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  // Softer, more fluid follow than a 1:1 cursor — a little lag reads as weight.
  const follow = { stiffness: 350, damping: 26, mass: 0.55 };
  const sx = useSpring(x, follow);
  const sy = useSpring(y, follow);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.documentElement.classList.add("bean-cursor-active");

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: MouseEvent) => {
      const el = e.target as Element | null;
      setHover(!!el?.closest('a, button, [role="button"], [data-cursor]'));
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      document.documentElement.classList.remove("bean-cursor-active");
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, [x, y]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[120] hidden md:block"
      style={{ x: sx, y: sy }}
    >
      <motion.svg
        width="44"
        height="44"
        viewBox="0 0 28 28"
        className="-ml-[22px] -mt-[22px] drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
        animate={{ scale: hover ? 1.65 : 1, rotate: hover ? 20 : -14 }}
        transition={{ type: "spring", stiffness: 260, damping: 16 }}
      >
        <ellipse
          cx="14"
          cy="14"
          rx="8"
          ry="11"
          fill={colors.gold}
          stroke={colors.charcoal}
          strokeWidth="1.3"
        />
        <path
          d="M14 5 Q17 14 14 23"
          fill="none"
          stroke={colors.charcoal}
          strokeWidth="1.3"
        />
      </motion.svg>
    </motion.div>
  );
}
