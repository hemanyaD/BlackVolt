"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { colors } from "@/lib/theme";

/**
 * Curved gold/charcoal bands sweep down across the screen on each route change
 * (reusing the preloader's wipe language). Skips the very first render so it
 * doesn't fire on initial load, and is disabled for reduced motion.
 */
export function PageWipe() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const firstRender = useRef(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (reduce) return;
    // Trigger the wipe in response to a navigation (pathname change is the
    // external event we're synchronising to).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlaying(true);
    const t = window.setTimeout(() => setPlaying(false), 900);
    return () => window.clearTimeout(t);
  }, [pathname, reduce]);

  const bands = [
    { color: colors.gold, delay: 0 },
    { color: colors.charcoal, delay: 0.1 },
  ];

  return (
    <AnimatePresence>
      {playing && (
        <div className="pointer-events-none fixed inset-0 z-[90]">
          {bands.map((band) => (
            <motion.div
              key={band.color}
              className="absolute left-[-20vw] h-[130vh] w-[140vw]"
              style={{
                background: band.color,
                borderBottomLeftRadius: "50% 14vh",
                borderBottomRightRadius: "50% 14vh",
              }}
              initial={{ y: "-140vh" }}
              animate={{ y: "100vh" }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.76, 0, 0.24, 1],
                delay: band.delay,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
