"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ButtonLink } from "@/components/Button";
import { CoffeePour } from "@/components/CoffeePour";
import { BeanField } from "@/components/BeanField";
import { Magnetic } from "@/components/Magnetic";

const words = ["A", "JOLT", "IN", "EVERY", "DROP."];

// Floating badges that pop in around the headline — playful, slightly rotated.
const badges = [
  { label: "15–20 cups", className: "left-0 top-2 -rotate-6", delay: 0.7 },
  { label: "₹25 / cup", className: "right-2 top-24 rotate-6", delay: 0.85 },
  { label: "café-grade", className: "left-10 bottom-2 rotate-3", delay: 1 },
];

const spring = { type: "spring" as const, stiffness: 320, damping: 18 };

export function Hero() {
  const reduce = useReducedMotion();

  // Pointer position over the hero (-0.5..0.5), spring-smoothed, drives the
  // parallax depth: layers translate by different amounts for a 3D feel.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spx = useSpring(px, { stiffness: 120, damping: 20 });
  const spy = useSpring(py, { stiffness: 120, damping: 20 });

  const useDepth = (amount: number) => ({
    x: useTransform(spx, [-0.5, 0.5], [-amount, amount]),
    y: useTransform(spy, [-0.5, 0.5], [-amount, amount]),
  });
  const beans = useDepth(36);
  const glow = useDepth(22);
  const pour = useDepth(-18);
  const content = useDepth(-10);

  function handleMove(e: React.MouseEvent<HTMLElement>) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }
  function resetParallax() {
    px.set(0);
    py.set(0);
  }

  return (
    <section
      onMouseMove={handleMove}
      onMouseLeave={resetParallax}
      className="relative flex min-h-[92vh] items-center overflow-hidden bg-charcoal text-cream"
    >
      {/* Realistic coffee pour, full-height on the right */}
      <motion.div
        aria-hidden="true"
        style={pour}
        className="pointer-events-none absolute inset-y-0 right-0 w-[68%] opacity-50 sm:w-[58%] md:opacity-100"
      >
        <CoffeePour className="h-full w-full" />
      </motion.div>

      {/* Gold glow */}
      <motion.div
        aria-hidden="true"
        style={glow}
        className="pointer-events-none absolute inset-0 opacity-60"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(55% 55% at 70% 35%, rgba(201,162,75,0.18), transparent 70%)",
          }}
        />
      </motion.div>
      {/* Readability scrim so the headline stays legible over the pour */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/80 to-transparent"
      />
      {/* Drifting coffee beans — confined to the left/text side so none float
          over the pour on the right (otherwise they read as specks in the coffee). */}
      <motion.div
        style={beans}
        className="pointer-events-none absolute inset-y-0 left-0 w-1/2 overflow-hidden"
      >
        <BeanField className="opacity-70" />
      </motion.div>

      <motion.div
        style={content}
        className="relative mx-auto w-full max-w-6xl px-5 pt-24 sm:px-8"
      >
        <motion.p
          className="mb-5 font-display text-sm font-bold uppercase tracking-[0.3em] text-gold"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Liquid coffee concentrate
        </motion.p>

        {/* Headline: each word springs up and scales in, with floating badges */}
        <div className="relative inline-block">
          <h1 className="flex max-w-4xl flex-wrap gap-x-4 font-display text-6xl font-black uppercase leading-[0.92] tracking-tight sm:text-8xl">
            {words.map((word, i) => (
              <motion.span
                key={word}
                className={word === "DROP." ? "text-gold" : undefined}
                initial={{ opacity: 0, y: 40, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ ...spring, delay: 0.15 + i * 0.09 }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {badges.map((badge) => (
            <motion.span
              key={badge.label}
              className={`absolute hidden font-display text-xs font-bold uppercase tracking-wide text-charcoal lg:block ${badge.className}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...spring, delay: badge.delay }}
            >
              <span className="inline-block rounded-full bg-gold px-3 py-1 shadow-lg">
                {badge.label}
              </span>
            </motion.span>
          ))}
        </div>

        <motion.p
          className="mt-7 max-w-xl text-lg text-cream/80"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          One bottle. 15–20 café-grade cups. About ₹25 each. Pour, add milk or
          water, and skip the queue. Concentrate strong enough to replace your
          coffee run.
        </motion.p>

        <motion.div
          className="mt-9 flex flex-wrap gap-4"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Magnetic>
            <ButtonLink href="/shop" size="lg">
              Shop the concentrate
            </ButtonLink>
          </Magnetic>
          <Magnetic>
            <ButtonLink href="/story" size="lg" variant="secondary">
              Our story
            </ButtonLink>
          </Magnetic>
        </motion.div>
      </motion.div>
    </section>
  );
}
