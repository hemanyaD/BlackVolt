"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { Eyebrow } from "@/components/Section";
import { MaskReveal } from "@/components/MaskReveal";
import type { Review } from "@/components/ReviewsShowcase";

/** True below the `sm` breakpoint (640px). Defaults to false (desktop) for SSR. */
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return mobile;
}

/**
 * Testimonials as a list of reviewer name rows (Marquet style). On hover, the
 * row highlights and a quote "blob" follows the cursor. On mobile (no hover),
 * each quote is shown inline beneath its name.
 */
export function TestimonialList({ reviews }: { reviews: Review[] }) {
  const [active, setActive] = useState<number | null>(null);
  const mobile = useIsMobile();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 300, damping: 28, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 300, damping: 28, mass: 0.4 });

  function handleMove(e: React.MouseEvent) {
    mx.set(e.clientX);
    my.set(e.clientY);
  }

  return (
    <section
      onMouseMove={mobile ? undefined : handleMove}
      onMouseLeave={() => setActive(null)}
      className="relative overflow-hidden bg-charcoal py-20 text-cream sm:py-28"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <Eyebrow>Testimonials</Eyebrow>
        <h2 className="max-w-4xl text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl">
          <MaskReveal>The people we&apos;ve jolted</MaskReveal>
        </h2>

        <ul className="mt-12 border-t border-cream/15">
          {reviews.map((review, i) => (
            <li
              key={review.name}
              onMouseEnter={() => setActive(i)}
              className="border-b border-cream/15"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 py-5 sm:py-7">
                <span
                  className={`font-display text-3xl font-black uppercase tracking-tight transition-colors duration-200 sm:text-5xl ${
                    active === i ? "text-gold" : "text-cream"
                  }`}
                >
                  {review.name}
                </span>
                <span className="font-display text-lg uppercase tracking-tight text-cream/45 sm:text-2xl">
                  | {review.city}
                </span>
              </div>
              {/* Mobile: quote inline (no hover available) */}
              {mobile && (
                <p className="pb-5 text-sm text-cream/70">“{review.quote}”</p>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Cursor-following quote blob (desktop only) */}
      {!mobile && (
        <motion.div
          className="pointer-events-none fixed left-0 top-0 z-[60]"
          style={{ x: sx, y: sy }}
        >
          <AnimatePresence mode="wait">
            {active !== null && (
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="w-96 -translate-x-1/2 -translate-y-[112%] bg-gold p-10 text-charcoal shadow-2xl"
                style={{
                  borderRadius: "42% 58% 62% 38% / 46% 42% 58% 54%",
                }}
              >
                <p className="font-display text-base font-bold uppercase tracking-wide">
                  {reviews[active].name}
                </p>
                <p className="mt-3 text-xl font-medium leading-snug">
                  “{reviews[active].quote}”
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}
