"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { colors } from "@/lib/theme";
import { Eyebrow } from "@/components/Section";
import { MaskReveal } from "@/components/MaskReveal";

const steps = [
  {
    n: "01",
    title: "Pour",
    desc: "One measured ounce of cold-pressed concentrate. Dark, glossy, and serious.",
  },
  {
    n: "02",
    title: "Add milk or water",
    desc: "Top it your way: cold water over ice, or hot milk for a thunderous latte.",
  },
  {
    n: "03",
    title: "Jolt",
    desc: "Stir and sip. Café-grade coffee in ten seconds flat. No machine, no queue.",
  },
];

/**
 * Scroll-driven brew narrative. A tall section pins a glass that fills as you
 * scroll: concentrate pours, then milk, then a finished cup with rising steam.
 * Everything is tied to scroll progress (not time), so it scrubs both ways.
 */
export function BrewStory() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setActive(p < 0.4 ? 0 : p < 0.72 ? 1 : 2);
  });

  // Liquid level (SVG y/height) — fills across the first ~two thirds.
  const fillY = useTransform(scrollYProgress, [0.08, 0.66], [236, 122]);
  const fillH = useTransform(scrollYProgress, [0.08, 0.66], [0, 114]);
  // Concentrate-dark → latte-brown as milk goes in.
  const liquidColor = useTransform(
    scrollYProgress,
    [0.1, 0.45, 0.7],
    ["#211d19", "#3a2b22", "#7a5a40"],
  );
  const cremaOpacity = useTransform(scrollYProgress, [0.6, 0.74], [0, 1]);

  // Pour streams.
  const bottleOpacity = useTransform(
    scrollYProgress,
    [0, 0.05, 0.36, 0.44],
    [0, 1, 1, 0],
  );
  const bottleRotate = useTransform(scrollYProgress, [0, 0.12], [-12, -38]);
  const coffeeStream = useTransform(
    scrollYProgress,
    [0.05, 0.12, 0.34, 0.4],
    [0, 1, 1, 0],
  );
  const milkOpacity = useTransform(
    scrollYProgress,
    [0.44, 0.5, 0.64, 0.7],
    [0, 1, 1, 0],
  );
  const steamOpacity = useTransform(scrollYProgress, [0.8, 0.95], [0, 0.7]);
  const labelOpacity = useTransform(scrollYProgress, [0.85, 1], [0, 1]);
  const labelY = useTransform(scrollYProgress, [0.85, 1], [16, 0]);

  return (
    <section ref={ref} className="relative h-[320vh] bg-charcoal text-cream">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 sm:px-8 md:grid-cols-2">
          {/* Narrative column */}
          <div>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
              <MaskReveal>From drop to jolt</MaskReveal>
            </h2>
            <ol className="mt-8 space-y-5">
              {steps.map((step, i) => (
                <li
                  key={step.n}
                  className={`flex gap-4 transition-opacity duration-300 ${
                    active === i ? "opacity-100" : "opacity-35"
                  }`}
                >
                  <span
                    className={`font-display text-3xl font-black ${
                      active === i ? "text-gold" : "text-cream/40"
                    }`}
                  >
                    {step.n}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-bold">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm text-cream/70">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Scene column */}
          <div className="flex justify-center">
            <svg
              viewBox="0 0 240 280"
              className="h-[60vh] max-h-[460px] w-auto"
              role="img"
              aria-label="A glass filling with BlackVolt coffee as the page scrolls"
            >
              <defs>
                <clipPath id="brew-glass">
                  <path d="M84 120 h72 a8 8 0 0 1 8 8 v96 a16 16 0 0 1 -16 16 h-56 a16 16 0 0 1 -16 -16 v-96 a8 8 0 0 1 8 -8 z" />
                </clipPath>
              </defs>

              {/* Concentrate bottle, pouring */}
              <motion.g
                style={{ opacity: bottleOpacity, rotate: bottleRotate }}
                transformTemplate={(_, t) => `translate(150px, 60px) ${t}`}
              >
                <rect
                  x="-16"
                  y="-34"
                  width="32"
                  height="60"
                  rx="8"
                  fill={colors.charcoal700}
                  stroke={colors.gold}
                  strokeWidth="2"
                />
                <rect x="-6" y="-44" width="12" height="12" rx="2" fill={colors.gold} />
              </motion.g>

              {/* Coffee pour stream */}
              <motion.rect
                x="132"
                y="64"
                width="5"
                height="58"
                rx="2.5"
                fill={colors.gold}
                style={{ opacity: coffeeStream }}
              />
              {/* Milk pour stream */}
              <motion.rect
                x="104"
                y="60"
                width="6"
                height="62"
                rx="3"
                fill={colors.cream}
                style={{ opacity: milkOpacity }}
              />

              {/* Glass outline */}
              <path
                d="M84 120 h72 a8 8 0 0 1 8 8 v96 a16 16 0 0 1 -16 16 h-56 a16 16 0 0 1 -16 -16 v-96 a8 8 0 0 1 8 -8 z"
                fill="none"
                stroke={colors.cream}
                strokeOpacity="0.45"
                strokeWidth="3"
              />

              {/* Liquid + crema, clipped */}
              <g clipPath="url(#brew-glass)">
                <motion.rect
                  x="76"
                  width="88"
                  style={{ y: fillY, height: fillH, fill: liquidColor }}
                />
                <motion.rect
                  x="76"
                  width="88"
                  height="6"
                  fill={colors.gold}
                  style={{ y: fillY, opacity: cremaOpacity }}
                />
              </g>

              {/* Steam */}
              <motion.g
                style={{ opacity: steamOpacity }}
                stroke={colors.cream}
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              >
                {[104, 120, 136].map((x, i) => (
                  <motion.path
                    key={x}
                    d={`M${x} 112 q6 -10 0 -20 q-6 -10 0 -20`}
                    animate={reduce ? undefined : { y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </motion.g>

              {/* Final label */}
              <motion.text
                x="120"
                y="270"
                textAnchor="middle"
                style={{ opacity: labelOpacity, y: labelY }}
                className="font-display"
                fill={colors.gold}
                fontSize="22"
                fontWeight="900"
                letterSpacing="2"
              >
                YOUR JOLT
              </motion.text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
