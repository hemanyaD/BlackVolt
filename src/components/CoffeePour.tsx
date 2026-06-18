"use client";

import { motion, useReducedMotion } from "framer-motion";

/*
  Two-vessel coffee pour for the hero: a tilted jug pours a stream into a cup
  that fills and swirls (the "mixing" read). Drawn for a dark background —
  coffee-brown fills, cream outlines, gold crema/accents — so it's legible as
  coffee, not an abstract blob. Looping motion respects prefers-reduced-motion.
*/
export function CoffeePour({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const cream = "#ECE9E1";
  const gold = "#C9A24B";

  // Cup geometry
  const cupTopY = 400;
  const cupCx = 300;
  const cupPath =
    "M250 400 H350 L341 500 a18 18 0 0 1 -18 16 H277 a18 18 0 0 1 -18 -16 Z";

  return (
    <svg
      viewBox="0 0 480 600"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cp-coffee" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a3a22" />
          <stop offset="100%" stopColor="#26160c" />
        </linearGradient>
        <linearGradient id="cp-stream" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2a1a0f" />
          <stop offset="50%" stopColor="#8a5630" />
          <stop offset="100%" stopColor="#2a1a0f" />
        </linearGradient>
        <radialGradient id="cp-crema" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0%" stopColor="#b89366" />
          <stop offset="100%" stopColor="#6f4f30" />
        </radialGradient>
        <filter id="cp-liquid" x="-40%" y="-20%" width="180%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02 0.06"
            numOctaves="2"
            seed="5"
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" />
        </filter>
        <filter id="cp-soft" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <clipPath id="cp-cup">
          <path d={cupPath} />
        </clipPath>
      </defs>

      {/* ===== BlackVolt bottle (pourer), tilted to pour from its mouth =====
          Drawn in local coords with the mouth at the origin, then translated to
          the stream's start (300,300) and rotated to tilt. */}
      <motion.g
        animate={reduce ? undefined : { y: [0, -3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <g transform="translate(300 300) rotate(-34)">
          {/* body (dark glass) */}
          <rect
            x="-32"
            y="-150"
            width="64"
            height="108"
            rx="12"
            fill="#3a2a1c"
            stroke={cream}
            strokeWidth="3"
          />
          {/* shoulder */}
          <path
            d="M-10 -26 L10 -26 L32 -45 L-32 -45 Z"
            fill="#3a2a1c"
            stroke={cream}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* neck + cap (gold) */}
          <rect x="-9" y="-30" width="18" height="30" rx="4" fill={gold} />
          {/* label */}
          <rect x="-33" y="-118" width="66" height="46" rx="2" fill={cream} />
          <rect x="-33" y="-118" width="66" height="4" fill={gold} />
          <rect x="-33" y="-76" width="66" height="4" fill={gold} />
          {/* bolt mark on the label */}
          <path
            d="M13.5 2 4 14h6l-1.5 8L20 9h-6l1.5-7z"
            fill="#281A0F"
            transform="translate(-10.8 -105.8) scale(0.9)"
          />
        </g>
      </motion.g>

      {/* ===== Pour stream ===== */}
      <motion.rect
        x="291"
        y="300"
        width="18"
        height="102"
        rx="9"
        fill="url(#cp-stream)"
        filter="url(#cp-liquid)"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        style={{ transformBox: "fill-box", transformOrigin: "top" }}
        transition={{ duration: 0.7, ease: "easeIn" }}
      />
      {/* ===== Cup (receiver), fills + swirls ===== */}
      {/* steam */}
      <motion.g
        filter="url(#cp-soft)"
        stroke={cream}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        animate={reduce ? undefined : { opacity: [0.2, 0.45, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {[284, 300, 316].map((x, i) => (
          <motion.path
            key={x}
            d={`M${x} 392 q14 -22 0 -44`}
            animate={reduce ? undefined : { y: [0, -12, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </motion.g>

      <g clipPath="url(#cp-cup)">
        {/* fills once */}
        <motion.rect
          x="250"
          width="100"
          fill="url(#cp-coffee)"
          initial={{ y: 514, height: 0 }}
          animate={{ y: 400, height: 116 }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.4 }}
        />
        {/* crema surface — a soft coffee-tan film, not a bright disc */}
        <motion.ellipse
          cx={cupCx}
          cy={cupTopY}
          rx="50"
          ry="10"
          fill="url(#cp-crema)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          transition={{ duration: 0.5, delay: 1.4 }}
        />
      </g>

      {/* cup outline, rim, handle, saucer */}
      <path d={cupPath} fill="none" stroke={cream} strokeWidth="3.5" />
      <ellipse
        cx={cupCx}
        cy={cupTopY}
        rx="50"
        ry="9"
        fill="none"
        stroke={cream}
        strokeWidth="3.5"
      />
      <path
        d="M350 414 C388 420 388 470 352 474"
        fill="none"
        stroke={cream}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <ellipse
        cx={cupCx}
        cy="524"
        rx="80"
        ry="11"
        fill="none"
        stroke={cream}
        strokeWidth="3.5"
      />

      {/* a couple of coffee beans for context */}
      {[
        { x: 150, y: 470, r: -20 },
        { x: 190, y: 492, r: 18 },
      ].map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y}) rotate(${b.r})`}>
          <ellipse rx="11" ry="7" fill={gold} />
          <path d="M0 -6 Q3 0 0 6" fill="none" stroke="#26160c" strokeWidth="1.5" />
        </g>
      ))}
    </svg>
  );
}
