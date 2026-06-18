"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/Button";
import { useCart, SUBSCRIPTION_DISCOUNT } from "@/context/CartContext";
import { formatINR } from "@/data/products";
import type { CartItem, Product } from "@/types";

/**
 * Interactive buy box for the product detail page: one-time vs. subscription
 * toggle, quantity stepper, and add-to-cart with an inline confirmation.
 */
export function ProductPurchase({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [mode, setMode] = useState<CartItem["mode"]>("once");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const unitPrice =
    mode === "subscribe"
      ? Math.round(product.priceINR * (1 - SUBSCRIPTION_DISCOUNT))
      : product.priceINR;

  function handleAdd() {
    addItem(product.slug, mode, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="font-display text-3xl font-black">
          {formatINR(unitPrice)}
        </span>
        {mode === "subscribe" && (
          <span className="text-sm text-charcoal/50 line-through">
            {formatINR(product.priceINR)}
          </span>
        )}
        <span className="text-sm text-charcoal/60">/ bottle</span>
      </div>

      {/* Purchase mode */}
      <fieldset className="mt-6">
        <legend className="font-display text-sm font-bold uppercase tracking-wide">
          Purchase
        </legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <ModeOption
            checked={mode === "once"}
            onChange={() => setMode("once")}
            title="One-time"
            subtitle="Pay once, no commitment"
          />
          <ModeOption
            checked={mode === "subscribe"}
            onChange={() => setMode("subscribe")}
            title="Subscribe monthly"
            subtitle={`Save ${Math.round(SUBSCRIPTION_DISCOUNT * 100)}% · skip anytime`}
          />
        </div>
      </fieldset>

      {/* Quantity */}
      <div className="mt-6 flex items-center gap-4">
        <span className="font-display text-sm font-bold uppercase tracking-wide">
          Quantity
        </span>
        <div className="flex items-center rounded-full ring-1 ring-charcoal/20">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="px-4 py-2 text-lg leading-none"
          >
            −
          </button>
          <span aria-live="polite" className="w-8 text-center font-bold">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            aria-label="Increase quantity"
            className="px-4 py-2 text-lg leading-none"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button size="lg" onClick={handleAdd}>
          Add to cart · {formatINR(unitPrice * qty)}
        </Button>
        <ButtonLink href="/cart" variant="secondary" size="lg">
          View cart
        </ButtonLink>
      </div>

      <p
        aria-live="polite"
        className={`mt-3 h-5 font-display text-sm font-bold text-gold transition-opacity ${
          added ? "opacity-100" : "opacity-0"
        }`}
      >
        Added to cart ⚡
      </p>
    </div>
  );
}

function ModeOption({
  checked,
  onChange,
  title,
  subtitle,
}: {
  checked: boolean;
  onChange: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <label
      className={`flex cursor-pointer flex-col rounded-xl border p-4 transition-colors ${
        checked
          ? "border-gold bg-gold/10"
          : "border-charcoal/15 hover:border-charcoal/30"
      }`}
    >
      <span className="flex items-center gap-2">
        <input
          type="radio"
          name="purchase-mode"
          checked={checked}
          onChange={onChange}
          className="accent-gold"
        />
        <span className="font-display font-bold">{title}</span>
      </span>
      <span className="mt-1 pl-6 text-sm text-charcoal/60">{subtitle}</span>
    </label>
  );
}
