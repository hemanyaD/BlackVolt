"use client";

import { motion, useReducedMotion } from "framer-motion";

/*
  Hero graphic: a tall glass of BlackVolt concentrate with a gold crema surface
  and wisps of steam rising and swaying on a loop. Drawn for the dark espresso
  hero — coffee-gradient fill, cream outlines, gold crema. Steam pauses for
  reduced motion.
*/
export function SteamingCup({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const cream = "#ECE9E1";
  const gold = "#C9A24B";

  // Glass outline / fill path (a gently tapered tumbler).
  const glassPath =
    "M128 214 H272 L258 410 a24 24 0 0 1 -24 20 H166 a24 24 0 0 1 -24 -20 Z";

  return (
    <svg
      viewBox="0 0 400 480"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      role="img"
      aria-label="A glass of BlackVolt coffee concentrate with rising steam"
    >
      <defs>
        <linearGradient id="cup-coffee" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a3a22" />
          <stop offset="100%" stopColor="#1a0f08" />
        </linearGradient>
        <radialGradient id="cup-crema" cx="0.5" cy="0.4" r="0.75">
          <stop offset="0%" stopColor="#e6c074" />
          <stop offset="100%" stopColor="#9c7a34" />
        </radialGradient>
        <clipPath id="cup-clip">
          <path d={glassPath} />
        </clipPath>
        <filter id="cup-steam-blur" x="-80%" y="-50%" width="260%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {/* Steam */}
      <motion.g
        filter="url(#cup-steam-blur)"
        stroke={cream}
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        animate={reduce ? undefined : { opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {[164, 200, 236].map((x, i) => (
          <motion.path
            key={x}
            d={`M${x} 196 q-18 -30 0 -60 q18 -30 0 -60`}
            animate={
              reduce
                ? undefined
                : { y: [0, -22, 0], x: [0, i % 2 ? 6 : -6, 0], opacity: [0.2, 0.7, 0.2] }
            }
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.6,
            }}
          />
        ))}
      </motion.g>

      {/* Coffee inside the glass */}
      <g clipPath="url(#cup-clip)">
        <rect x="120" y="214" width="160" height="220" fill="url(#cup-coffee)" />
        {/* Glass sheen on the left */}
        <rect x="138" y="226" width="14" height="180" rx="7" fill={cream} opacity="0.12" />
      </g>

      {/* Crema surface */}
      <ellipse cx="200" cy="214" rx="72" ry="13" fill="url(#cup-crema)" />

      {/* Glass outline + rim */}
      <path d={glassPath} fill="none" stroke={cream} strokeWidth="4" />
      <ellipse cx="200" cy="214" rx="72" ry="13" fill="none" stroke={cream} strokeWidth="4" />

      {/* Soft reflection beneath the glass */}
      <ellipse cx="200" cy="444" rx="78" ry="9" fill={gold} opacity="0.12" />
    </svg>
  );
}
