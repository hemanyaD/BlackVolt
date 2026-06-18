"use client";

import Link from "next/link";
import { Section } from "@/components/Section";
import { Button, ButtonLink } from "@/components/Button";
import { ProductImage } from "@/components/ProductImage";
import { MaskReveal } from "@/components/MaskReveal";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/data/products";

export default function CartPage() {
  const { lines, subtotal, count, setQuantity, removeItem, clear } = useCart();

  if (lines.length === 0) {
    return (
      <Section tone="cream" className="pt-28">
        <h1 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
          <MaskReveal>Your cart is empty</MaskReveal>
        </h1>
        <p className="mt-4 text-charcoal/70">
          No jolt in here yet. Let&apos;s fix that.
        </p>
        <div className="mt-8">
          <ButtonLink href="/shop" size="lg">
            Shop the concentrate
          </ButtonLink>
        </div>
      </Section>
    );
  }

  return (
    <Section tone="cream" className="pt-28">
      <div className="flex items-end justify-between">
        <h1 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
          <MaskReveal>Your cart</MaskReveal>
        </h1>
        <button
          type="button"
          onClick={clear}
          className="text-sm text-charcoal/60 underline-offset-4 hover:text-gold hover:underline"
        >
          Clear cart
        </button>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        {/* Line items */}
        <ul className="divide-y divide-charcoal/10">
          {lines.map((line) => (
            <li
              key={`${line.slug}-${line.mode}`}
              className="flex gap-4 py-5 sm:gap-6"
            >
              <Link
                href={`/shop/${line.slug}`}
                className="shrink-0"
                aria-label={line.product.name}
              >
                <ProductImage
                  name={line.product.name}
                  placeholder={line.product.imagePlaceholder}
                  className="h-24 w-20 rounded-lg sm:h-28 sm:w-24"
                />
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <div>
                    <h2 className="font-display text-lg font-bold">
                      <Link
                        href={`/shop/${line.slug}`}
                        className="hover:text-gold"
                      >
                        {line.product.name}
                      </Link>
                    </h2>
                    <p className="text-sm text-charcoal/60">
                      {line.mode === "subscribe"
                        ? "Monthly subscription"
                        : "One-time"}{" "}
                      · {formatINR(line.unitPrice)} each
                    </p>
                  </div>
                  <p className="font-display font-bold">
                    {formatINR(line.lineTotal)}
                  </p>
                </div>

                <div className="mt-auto flex items-center gap-4 pt-3">
                  <div className="flex items-center rounded-full ring-1 ring-charcoal/20">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(line.slug, line.mode, line.quantity - 1)
                      }
                      aria-label={`Decrease ${line.product.name} quantity`}
                      className="px-3 py-1.5 text-lg leading-none"
                    >
                      −
                    </button>
                    <span className="w-7 text-center text-sm font-bold">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(line.slug, line.mode, line.quantity + 1)
                      }
                      aria-label={`Increase ${line.product.name} quantity`}
                      className="px-3 py-1.5 text-lg leading-none"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(line.slug, line.mode)}
                    className="text-sm text-charcoal/60 underline-offset-4 hover:text-gold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <aside className="h-fit rounded-2xl bg-white p-6 ring-1 ring-charcoal/10">
          <h2 className="font-display text-xl font-bold">Order summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-charcoal/70">
                Subtotal ({count} {count === 1 ? "bottle" : "bottles"})
              </dt>
              <dd className="font-bold">{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-charcoal/70">Shipping</dt>
              <dd className="text-charcoal/70">Calculated at checkout</dd>
            </div>
          </dl>
          <div className="mt-5 flex justify-between border-t border-charcoal/15 pt-5">
            <span className="font-display text-lg font-bold">Total</span>
            <span className="font-display text-lg font-bold">
              {formatINR(subtotal)}
            </span>
          </div>
          <Button
            size="lg"
            className="mt-6 w-full"
            onClick={() =>
              alert("Checkout is a stub in this demo. No payment is taken.")
            }
          >
            Proceed to checkout
          </Button>
          <ButtonLink
            href="/shop"
            variant="secondary"
            className="mt-3 w-full"
          >
            Keep shopping
          </ButtonLink>
        </aside>
      </div>
    </Section>
  );
}
