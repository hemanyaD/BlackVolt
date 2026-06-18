"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ProductImage } from "@/components/ProductImage";
import { Button } from "@/components/Button";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/data/products";
import { PRODUCT_TYPE_LABELS, type Product } from "@/types";

/**
 * Product tile for the shop grid and the home "Featured" row. The whole card
 * links to the detail page; the add-to-cart button stops propagation so it
 * doesn't also navigate.
 */
export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Cursor position over the card, normalized to -0.5..0.5, spring-smoothed.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 200, damping: 20 });
  const sy = useSpring(my, { stiffness: 200, damping: 20 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-11, 11]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [9, -9]);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }

  function resetTilt() {
    mx.set(0);
    my.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={resetTilt}
      whileHover={{ scale: 1.02 }}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 900,
        transformStyle: "preserve-3d",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-charcoal/10 transition-shadow duration-300 hover:shadow-xl"
    >
      <Link
        href={`/shop/${product.slug}`}
        className="block focus:outline-none"
        aria-label={`View ${product.name}`}
      >
        <ProductImage
          name={product.name}
          placeholder={product.imagePlaceholder}
          className="aspect-[4/5] w-full transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>

      {product.badges.length > 0 && (
        <div className="absolute left-3 top-3 flex gap-1.5">
          {product.badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full bg-cream/95 px-2.5 py-1 font-display text-xs font-bold uppercase tracking-wide text-charcoal"
            >
              {badge}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <p className="font-display text-xs font-bold uppercase tracking-[0.15em] text-gold">
          {PRODUCT_TYPE_LABELS[product.type]}
        </p>
        <h3 className="mt-1 font-display text-xl font-bold">
          <Link href={`/shop/${product.slug}`} className="hover:text-gold">
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm text-charcoal/70">
          {product.shortDesc}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="font-display text-lg font-bold">
              {formatINR(product.priceINR)}
            </p>
            <p className="text-xs text-charcoal/60">
              {product.cupsPerBottle} cups · {product.sizeMl}ml
            </p>
          </div>
          <Button
            size="md"
            onClick={() => addItem(product.slug)}
            aria-label={`Add ${product.name} to cart`}
          >
            Add
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
