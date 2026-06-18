"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { colors } from "@/lib/theme";

const SESSION_KEY = "blackvolt:intro-played";

const STATUS = [
  "Grinding the beans…",
  "Blooming the grounds…",
  "Pressing the concentrate…",
  "Ready to jolt ⚡",
];

// Fill takes this long; status text + curved wipe are timed around it.
const BREW_MS = 2600;

type Phase = "brew" | "reveal" | "done";

/**
 * First-visit intro: a concentrate bottle pours and a glass fills while status
 * text cycles, then the screen wipes away in staggered curved bands
 * (charcoal → gold → cream → page). Plays once per session and is skipped
 * entirely for users who prefer reduced motion.
 */
export function Preloader() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("brew");
  const [step, setStep] = useState(0);

  // Decide whether to play at all (client-only: sessionStorage + reduced motion).
  useEffect(() => {
    const played =
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(SESSION_KEY);
    if (played || reduce) {
      // Skip the intro entirely. This decision depends on client-only state
      // (sessionStorage / reduced-motion), so it can't be set before mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("done");
      return;
    }
    const toReveal = window.setTimeout(() => setPhase("reveal"), BREW_MS);
    return () => window.clearTimeout(toReveal);
  }, [reduce]);

  // Cycle the status lines during the brew phase.
  useEffect(() => {
    if (phase !== "brew") return;
    const id = window.setInterval(
      () => setStep((s) => Math.min(s + 1, STATUS.length - 1)),
      BREW_MS / STATUS.length,
    );
    return () => window.clearInterval(id);
  }, [phase]);

  function finish() {
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // ignore storage failures
    }
    setPhase("done");
  }

  // Charcoal (front) → gold → cream (back). Front leaves first on the wipe.
  const bands = [
    { color: colors.charcoal, z: 30, delay: 0 },
    { color: colors.gold, z: 20, delay: 0.12 },
    { color: colors.cream, z: 10, delay: 0.24 },
  ];

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[100] overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Curved layered bands that sweep up to reveal the page. */}
          {bands.map((band) => (
            <motion.div
              key={band.color}
              className="absolute left-[-20vw] top-0 h-[120vh] w-[140vw]"
              style={{
                background: band.color,
                zIndex: band.z,
                borderBottomLeftRadius: "50% 16vh",
                borderBottomRightRadius: "50% 16vh",
              }}
              initial={{ y: 0 }}
              animate={phase === "reveal" ? { y: "-132vh" } : { y: 0 }}
              transition={{
                duration: 0.75,
                ease: [0.76, 0, 0.24, 1],
                delay: band.delay,
              }}
              // The last band to leave (cream) ends the intro.
              onAnimationComplete={() => {
                if (phase === "reveal" && band.color === colors.cream) finish();
              }}
            />
          ))}

          {/* Brew scene sits above the bands and fades as the wipe starts. */}
          <motion.div
            className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-8 px-6"
            animate={{ opacity: phase === "reveal" ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <PourScene />
            <div className="text-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={step}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="font-display text-sm font-bold uppercase tracking-[0.25em] text-gold"
                >
                  {STATUS[step]}
                </motion.p>
              </AnimatePresence>
              <p className="mt-3 font-display text-2xl font-black uppercase tracking-tight text-cream">
                BLACK<span className="text-gold">VOLT</span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Concentrate bottle pouring into a filling glass, drawn in SVG. */
function PourScene() {
  const fill = {
    initial: { y: 196, height: 0 },
    animate: { y: 124, height: 72 },
    transition: { duration: BREW_MS / 1000 - 0.4, ease: "easeInOut", delay: 0.4 },
  } as const;

  return (
    <svg
      viewBox="0 0 240 230"
      className="h-44 w-44"
      role="img"
      aria-label="Pouring BlackVolt concentrate into a glass"
    >
      <defs>
        <clipPath id="glass-interior">
          <rect x="96" y="122" width="48" height="76" rx="9" />
        </clipPath>
      </defs>

      {/* Bottle, tilted, pouring from its mouth */}
      <g transform="rotate(-34 150 70)">
        <rect
          x="146"
          y="26"
          width="30"
          height="58"
          rx="8"
          fill={colors.charcoal700}
          stroke={colors.gold}
          strokeWidth="2"
        />
        <rect x="156" y="16" width="10" height="12" rx="2" fill={colors.gold} />
      </g>

      {/* Pour stream */}
      <motion.rect
        x="136"
        width="4"
        rx="2"
        fill={colors.gold}
        initial={{ y: 74, height: 0, opacity: 0 }}
        animate={{
          y: 74,
          height: [0, 52, 52, 0],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: BREW_MS / 1000,
          times: [0, 0.2, 0.9, 1],
          ease: "easeInOut",
        }}
      />

      {/* Glass outline */}
      <rect
        x="96"
        y="122"
        width="48"
        height="76"
        rx="9"
        fill="none"
        stroke={colors.cream}
        strokeOpacity="0.5"
        strokeWidth="2.5"
      />

      {/* Liquid + gold crema, clipped to the glass */}
      <g clipPath="url(#glass-interior)">
        <motion.rect
          x="96"
          width="48"
          fill="#241f1b"
          initial={fill.initial}
          animate={fill.animate}
          transition={fill.transition}
        />
        <motion.rect
          x="96"
          width="48"
          height="5"
          fill={colors.gold}
          initial={{ y: 196 }}
          animate={{ y: 124 }}
          transition={fill.transition}
        />
      </g>

      {/* Falling drips for life */}
      {[0, 0.5].map((d) => (
        <motion.circle
          key={d}
          cx="138"
          r="2.5"
          fill={colors.gold}
          initial={{ cy: 80, opacity: 0 }}
          animate={{ cy: [80, 120], opacity: [0, 1, 0] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            ease: "easeIn",
            delay: 0.6 + d,
          }}
        />
      ))}
    </svg>
  );
}
