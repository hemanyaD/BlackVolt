"use client";

import { motion, useReducedMotion } from "framer-motion";
import { colors } from "@/lib/theme";

/*
  Hand-built line-art coffee machines in the BlackVolt palette: charcoal strokes
  (via currentColor) with gold accents, on a light surface. Each has a small,
  restrained animation (steam, flame, press, drip) that pauses for reduced
  motion. Drop one of these into any element with `text-charcoal`.
*/

const gold = colors.gold;

/** Shared SVG frame: square viewBox, charcoal strokes, gold-able children. */
function Frame({
  children,
  label,
  className = "",
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 140 140"
      className={className}
      role="img"
      aria-label={label}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

/** Decorative four-point sparkle. */
function Sparkle({ x, y, s = 5 }: { x: number; y: number; s?: number }) {
  return (
    <path
      d={`M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z`}
      fill={gold}
      stroke="none"
    />
  );
}

export function EspressoMachine({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <Frame label="Espresso machine" className={className}>
      {/* Steam */}
      <motion.g
        stroke={gold}
        strokeWidth={2.5}
        animate={reduce ? undefined : { y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M70 48 q5 -7 0 -14 q-5 -7 0 -14" />
        <path d="M80 48 q5 -7 0 -14 q-5 -7 0 -14" />
      </motion.g>

      {/* Body */}
      <rect x="24" y="50" width="92" height="56" rx="6" />
      <path d="M24 66 H116" />
      {/* Group head + spouts */}
      <rect x="46" y="72" width="20" height="9" rx="2" />
      <path d="M53 81 V88 M59 81 V88" />
      {/* Cup */}
      <path d="M48 90 h16 v8 a4 4 0 0 1 -4 4 h-8 a4 4 0 0 1 -4 -4 z" />
      <path d="M64 92 q6 0 6 5 q0 5 -6 5" />
      {/* Steam wand */}
      <path d="M108 74 L116 94" />
      {/* Feet */}
      <path d="M34 106 V112 M106 106 V112" />
      {/* Buttons */}
      <circle cx="94" cy="76" r="3.2" fill={gold} stroke="none" />
      <circle cx="104" cy="76" r="3.2" fill={gold} stroke="none" />
      <Sparkle x={122} y={44} />
    </Frame>
  );
}

export function MokaPot({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <Frame label="Moka pot" className={className}>
      {/* Bottom chamber */}
      <path d="M42 102 H98 L91 74 H49 Z" />
      {/* Top chamber */}
      <path d="M49 74 H91 L84 46 H56 Z" />
      {/* Lid knob */}
      <path d="M70 46 V40" />
      <circle cx="70" cy="37" r="4" fill={gold} stroke="none" />
      {/* Spout beak */}
      <path d="M56 54 L48 51 L56 60" />
      {/* Handle */}
      <path d="M91 52 q20 2 20 18 q0 8 -8 10" />
      {/* Flame */}
      <motion.g
        fill={gold}
        stroke="none"
        animate={reduce ? undefined : { scaleY: [1, 1.18, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "70px 110px" }}
      >
        <path d="M70 118 q-8 -6 -4 -14 q4 4 4 0 q4 8 4 14 q0 4 -4 0 z" />
        <path d="M58 116 q-5 -4 -2 -9 q3 4 4 1 q2 6 -1 9 q-1 1 -1 -1 z" />
        <path d="M82 116 q5 -4 2 -9 q-3 4 -4 1 q-2 6 1 9 q1 1 1 -1 z" />
      </motion.g>
      <Sparkle x={34} y={50} />
    </Frame>
  );
}

export function AeroPress({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <Frame label="AeroPress" className={className}>
      {/* Press arrows */}
      <motion.g
        stroke={gold}
        strokeWidth={2.5}
        animate={reduce ? undefined : { y: [0, 5, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M64 16 L70 22 L76 16" />
        <path d="M64 24 L70 30 L76 24" />
      </motion.g>
      {/* Plunger handle */}
      <rect x="64" y="32" width="12" height="14" rx="2" />
      {/* Cap */}
      <rect x="50" y="46" width="40" height="12" rx="3" />
      {/* Chamber */}
      <rect x="52" y="58" width="36" height="42" rx="3" />
      <path d="M52 70 H88" stroke={gold} strokeWidth={2.5} />
      {/* Filter cap */}
      <path d="M52 100 H88 L82 110 H58 Z" />
      <path d="M62 110 V113 M70 110 V113 M78 110 V113" strokeWidth={2} />
      {/* Drip */}
      <motion.circle
        cx="70"
        r="3"
        fill={gold}
        stroke="none"
        initial={{ cy: 114, opacity: 0 }}
        animate={reduce ? { cy: 120, opacity: 1 } : { cy: [114, 126], opacity: [0, 1, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeIn" }}
      />
      <Sparkle x={40} y={42} />
    </Frame>
  );
}

export function ColdBrewTower({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <Frame label="Cold brew tower" className={className}>
      {/* Stand */}
      <path d="M38 26 V120 M102 26 V120" />
      <path d="M30 124 H110" />
      <path d="M38 26 H102" />
      {/* Water globe */}
      <circle cx="70" cy="44" r="16" />
      <path d="M70 60 V66" />
      {/* Grounds chamber */}
      <rect x="58" y="66" width="24" height="26" rx="3" />
      <path d="M58 80 H82" stroke={gold} strokeWidth={2.5} />
      {/* Cone to carafe */}
      <path d="M58 92 L70 102 L82 92" />
      {/* Carafe */}
      <path d="M54 102 h32 v14 a6 6 0 0 1 -6 6 h-20 a6 6 0 0 1 -6 -6 z" />
      <path d="M54 112 h32" stroke={gold} strokeWidth={2.5} />
      {/* Drips */}
      {[0, 0.7].map((d) => (
        <motion.circle
          key={d}
          cx="70"
          r="2.6"
          fill={gold}
          stroke="none"
          initial={{ cy: 66, opacity: 0 }}
          animate={reduce ? { cy: 100, opacity: 1 } : { cy: [66, 100], opacity: [0, 1, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeIn", delay: d }}
        />
      ))}
      <Sparkle x={112} y={40} />
      <Sparkle x={26} y={70} s={4} />
    </Frame>
  );
}
