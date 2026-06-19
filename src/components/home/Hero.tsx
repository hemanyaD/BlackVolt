"use client";

import { motion } from "framer-motion";
import { ButtonLink } from "@/components/Button";
import { Magnetic } from "@/components/Magnetic";

const words = ["A", "JOLT", "IN", "EVERY", "DROP."];

const spring = { type: "spring" as const, stiffness: 320, damping: 18 };

/*
  Full-bleed background-video hero (HUCK style). Drop a royalty-free coffee clip
  at:  public/hero.mp4  (and optionally public/hero.webm + public/hero-poster.jpg).
  Until a file exists the <video> simply shows nothing and the espresso
  background + scrim render as a clean dark hero — no broken state.
  Good free sources: pexels.com/videos, coverr.co, mixkit.co (search "coffee pour").
*/
export function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-charcoal text-cream">
      {/* Background video */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/hero-poster.jpg"
      >
        <source src="/hero.webm" type="video/webm" />
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      {/* Scrims for headline legibility over the footage */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/75 to-charcoal/25"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-transparent to-charcoal/40"
      />
      {/* Warm gold wash to keep it on-brand */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light"
        style={{
          background:
            "radial-gradient(60% 60% at 65% 40%, rgba(201,162,75,0.4), transparent 70%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl px-5 pt-24 sm:px-8">
        <motion.p
          className="mb-5 font-display text-sm font-bold uppercase tracking-[0.3em] text-gold"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Liquid coffee concentrate
        </motion.p>

        <h1 className="flex max-w-4xl flex-wrap gap-x-4 font-display text-6xl font-black uppercase leading-[0.92] tracking-tight drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)] sm:text-8xl">
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

        <motion.p
          className="mt-7 max-w-xl text-lg text-cream/85"
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
      </div>
    </section>
  );
}
