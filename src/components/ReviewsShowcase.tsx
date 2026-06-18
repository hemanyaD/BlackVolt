"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

export interface Review {
  quote: string;
  name: string;
  city: string;
}

// Each card's scatter position, tilt, and scroll-parallax travel (px) — sm+ only.
// Cards are inset from the edges (never left-0/right-0) and travel is small, so
// tilt + parallax can't push them past the section and get clipped.
const layout = [
  { className: "left-[3%] top-[3%] w-72 lg:w-80", rot: -3, range: [38, -38] },
  { className: "right-[3%] top-[34%] w-72 lg:w-80", rot: 3, range: [48, -40] },
  { className: "left-[14%] bottom-[3%] w-72 lg:w-80", rot: 4, range: [34, -48] },
];

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
 * Reviews in the Frituur style: a giant background "REVIEWS" word with cards
 * floating over it, scattered/tilted and parallaxing on scroll. On mobile this
 * collapses to a clean stacked column under a normal heading (no overlap).
 */
export function ReviewsShowcase({ reviews }: { reviews: Review[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const mobile = useIsMobile();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-charcoal py-16 sm:py-24"
    >
      {/* Giant background word — sm+ only (bleeds, clipped by the section) */}
      <div className="pointer-events-none absolute inset-0 hidden items-center justify-center sm:flex">
        <span className="font-display text-[20vw] font-black uppercase leading-none tracking-tight text-gold/90">
          Reviews
        </span>
      </div>

      {/* Mobile heading */}
      <div className="px-5 sm:hidden">
        <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-cream/60">
          The verdict
        </p>
        <h2 className="mt-1 font-display text-6xl font-black uppercase tracking-tight text-gold">
          Reviews
        </h2>
      </div>

      {/* Desktop eyebrow */}
      <p className="absolute left-8 top-12 hidden font-display text-sm font-bold uppercase tracking-[0.2em] text-cream/60 sm:block">
        The verdict
      </p>

      {/* Cards: stacked column on mobile, scattered + floating on sm+ */}
      <div className="relative mx-auto mt-8 flex w-full max-w-md flex-col gap-5 px-5 sm:mt-10 sm:block sm:h-[480px] sm:max-w-4xl sm:px-8">
        {reviews.slice(0, 3).map((review, i) => (
          <Card
            key={review.name}
            review={review}
            scrollYProgress={scrollYProgress}
            range={layout[i].range}
            rot={layout[i].rot}
            className={layout[i].className}
            mobile={mobile}
          />
        ))}
      </div>
    </section>
  );
}

function Card({
  review,
  scrollYProgress,
  range,
  rot,
  className,
  mobile,
}: {
  review: Review;
  scrollYProgress: MotionValue<number>;
  range: number[];
  rot: number;
  className: string;
  mobile: boolean;
}) {
  const reduce = useReducedMotion();
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduce || mobile ? [0, 0] : range,
  );

  return (
    <motion.figure
      style={mobile ? undefined : { y, rotate: rot }}
      className={`rounded-2xl bg-cream p-6 text-charcoal ring-1 ring-charcoal/10 ${
        mobile ? "relative w-full shadow-lg" : `absolute shadow-2xl ${className}`
      }`}
    >
      <div aria-hidden="true" className="text-gold">
        ★★★★★
      </div>
      <blockquote className="mt-3 text-sm text-charcoal/85 sm:text-base">
        “{review.quote}”
      </blockquote>
      <figcaption className="mt-4 font-display text-sm font-bold uppercase tracking-wide text-charcoal/60">
        {review.name} · {review.city}
      </figcaption>
    </motion.figure>
  );
}
