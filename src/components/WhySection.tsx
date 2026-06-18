"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useAnimationControls,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { Section, Eyebrow } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { MaskReveal } from "@/components/MaskReveal";
import { Bolt } from "@/components/Logo";
import { formatINR } from "@/data/products";

// Per-cup economics used by the calculator.
const CAFE_PER_CUP = 200;
const BV_PER_CUP = 25;
const DAYS = 365;
const MAX_CUPS = 6;

const reasons = [
  {
    title: "Ten-second coffee",
    body: "Pour, add water or milk, done. No machine, no grind, no queue.",
  },
  {
    title: "15–20 cups a bottle",
    body: "One 500ml bottle of concentrate outlasts weeks of café runs.",
  },
  {
    title: "Estate-direct beans",
    body: "Sourced straight from Indian estates and roasted for concentrate.",
  },
  {
    title: "Always consistent",
    body: "The same café-grade cup every time. No barista roulette.",
  },
];

// Tiers are spaced so most slider steps cross one (≈₹63.9k saved per cup/day),
// which makes the savings figure pulse on nearly every drag.
const TIERS = [
  { min: 0, text: "Still, why pay more for the same caffeine?" },
  { min: 100_000, text: "That's a month of groceries you didn't drink." },
  { min: 160_000, text: "That's a long weekend away, paid for in lattes." },
  { min: 220_000, text: "That's a serious holiday fund, on coffee alone." },
  { min: 290_000, text: "That's a flight abroad, every single year." },
  { min: 350_000, text: "That's two flights abroad. On coffee." },
];

function tierIndex(savings: number): number {
  let idx = 0;
  for (let i = 0; i < TIERS.length; i++) {
    if (savings >= TIERS[i].min) idx = i;
  }
  return idx;
}

export function WhySection() {
  const [cups, setCups] = useState(2);
  const reduce = useReducedMotion();

  const cafeYear = cups * DAYS * CAFE_PER_CUP;
  const bvYear = cups * DAYS * BV_PER_CUP;
  const savings = cafeYear - bvYear;
  const max = MAX_CUPS * DAYS * CAFE_PER_CUP;

  const tier = tierIndex(savings);

  // Pulse the savings figure whenever it crosses into a new tier.
  const pulse = useAnimationControls();
  const firstTier = useRef(true);
  useEffect(() => {
    if (firstTier.current) {
      firstTier.current = false;
      return;
    }
    if (reduce) return;
    // "Ka-ching": overshoot scale + a quick horizontal shake + tilt + gold flash.
    pulse.start({
      scale: [1, 1.38, 0.94, 1.12, 1],
      x: [0, -8, 7, -5, 3, 0],
      rotate: [0, -4, 3.5, -2, 1, 0],
      color: ["#ECE9E1", "#E0BD6A", "#C9A24B", "#ECE9E1"],
      textShadow: [
        "0 0 0px rgba(201,162,75,0)",
        "0 0 22px rgba(224,189,106,0.75)",
        "0 0 0px rgba(201,162,75,0)",
      ],
      transition: { duration: 0.55, ease: [0.34, 1.56, 0.64, 1] },
    });
  }, [tier, reduce, pulse]);

  return (
    <Section tone="cream">
      <Reveal>
        <Eyebrow>Why concentrate</Eyebrow>
        <h2 className="max-w-2xl text-4xl font-black uppercase tracking-tight sm:text-5xl">
          <MaskReveal>Do the math, not the queue</MaskReveal>
        </h2>
        <p className="mt-4 max-w-xl text-charcoal/70">
          Drag the slider. See what your coffee habit really costs, and what
          BlackVolt gives back.
        </p>
      </Reveal>

      {/* Calculator */}
      <Reveal delay={0.1}>
        <div className="mt-10 grid gap-8 rounded-3xl bg-white p-6 ring-1 ring-charcoal/10 sm:p-10 lg:grid-cols-[1fr_1.1fr]">
          {/* Slider side */}
          <div className="flex flex-col justify-center">
            <label
              htmlFor="cups-slider"
              className="font-display text-sm font-bold uppercase tracking-wide text-charcoal/60"
            >
              How many cups a day?
            </label>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-6xl font-black text-gold">
                {cups}
              </span>
              <span className="text-charcoal/60">
                {cups === 1 ? "cup" : "cups"} / day
              </span>
            </div>
            <input
              id="cups-slider"
              type="range"
              min={1}
              max={MAX_CUPS}
              step={1}
              value={cups}
              onChange={(e) => setCups(Number(e.target.value))}
              className="mt-6 w-full accent-gold"
              aria-valuetext={`${cups} cups per day`}
            />
            <div className="mt-2 flex justify-between text-xs text-charcoal/40">
              <span>1</span>
              <span>{MAX_CUPS}</span>
            </div>
          </div>

          {/* Comparison side */}
          <div className="flex flex-col justify-center gap-5">
            <Bar
              label={`Café · ₹${CAFE_PER_CUP}/cup`}
              value={cafeYear}
              max={max}
              tone="cafe"
            />
            <Bar
              label={`BlackVolt · ₹${BV_PER_CUP}/cup`}
              value={bvYear}
              max={max}
              tone="bv"
            />

            <div className="mt-2 rounded-2xl bg-charcoal p-5 text-cream">
              <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-gold">
                You&apos;d save
              </p>
              <p className="mt-1 font-display text-4xl font-black sm:text-5xl">
                <motion.span
                  className="inline-block origin-center"
                  animate={pulse}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <AnimatedINR value={savings} />
                </motion.span>
                <span className="ml-2 align-middle text-base font-bold text-cream/60">
                  / year
                </span>
              </p>
              <motion.p
                key={tier}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-cream/70"
              >
                {TIERS[tier].text}
              </motion.p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Reason cards with cursor spotlight */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {reasons.map((reason, i) => (
          <Reveal key={reason.title} delay={i * 0.08}>
            <SpotlightCard>
              <Bolt className="h-7 w-7 text-gold" />
              <h3 className="mt-4 font-display text-xl font-bold">
                {reason.title}
              </h3>
              <p className="mt-2 text-sm text-charcoal/70">{reason.body}</p>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/** Animated horizontal bar whose width and rupee figure ease to the target. */
function Bar({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: "cafe" | "bv";
}) {
  const pct = Math.max(4, (value / max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-display font-bold uppercase tracking-wide text-charcoal/70">
          {label}
        </span>
        <span className="font-display font-bold">
          <AnimatedINR value={value} />
          <span className="text-charcoal/50"> /yr</span>
        </span>
      </div>
      <div className="mt-2 h-4 overflow-hidden rounded-full bg-charcoal/10">
        <motion.div
          className={`h-full rounded-full ${
            tone === "cafe" ? "bg-charcoal/70" : "bg-gold"
          }`}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}

/** Rupee figure that springs to its target value as inputs change. */
function AnimatedINR({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const controls = animate(mv, value, {
      duration: reduce ? 0 : 0.6,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [value, mv, reduce]);

  useMotionValueEvent(mv, "change", (v) => setDisplay(v));

  return <>{formatINR(Math.round(display))}</>;
}

/** Card with a soft gold glow that follows the cursor. */
function SpotlightCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const background = useMotionTemplate`radial-gradient(160px circle at ${mx}% ${my}%, rgba(201,162,75,0.18), transparent 70%)`;

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(((e.clientX - r.left) / r.width) * 100);
    my.set(((e.clientY - r.top) / r.height) * 100);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className="group relative h-full overflow-hidden rounded-2xl bg-white p-6 ring-1 ring-charcoal/10 transition-shadow duration-300 hover:shadow-xl"
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
