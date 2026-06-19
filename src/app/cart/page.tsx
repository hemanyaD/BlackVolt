"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Section } from "@/components/Section";
import { Button, ButtonLink } from "@/components/Button";
import { ProductImage } from "@/components/ProductImage";
import { MaskReveal } from "@/components/MaskReveal";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import { formatINR } from "@/data/products";
import { FREE_SHIPPING_THRESHOLD, shippingFor } from "@/lib/shipping";

type Stage = "cart" | "checkout";

const EMPTY_FORM = {
  customerName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  pincode: "",
};

export default function CartPage() {
  const { lines, subtotal, count, setQuantity, removeItem, clear } = useCart();
  const { user } = useUser();
  const router = useRouter();

  const [stage, setStage] = useState<Stage>("cart");
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set once an order is placed; cart is cleared so we show this instead.
  const [placedId, setPlacedId] = useState<string | null>(null);

  // Order confirmation takes precedence — the cart is empty by now.
  if (placedId) {
    return (
      <Section tone="cream" className="pt-28">
        <h1 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
          <MaskReveal>Order placed</MaskReveal>
        </h1>
        <p className="mt-4 max-w-prose text-charcoal/70">
          Thanks for the jolt. Your order{" "}
          <span className="font-display font-bold text-charcoal">{placedId}</span>{" "}
          is in. You&apos;ll get a confirmation shortly. (This is a demo — no
          payment was taken.)
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/shop" size="lg">
            Keep shopping
          </ButtonLink>
        </div>
      </Section>
    );
  }

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

  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // Checkout requires an account. Signed-in users get their saved details
  // prefilled; everyone else is sent to sign in and returned here.
  function goToCheckout() {
    if (!user) {
      router.push("/login?next=/cart");
      return;
    }
    setForm({
      customerName: user.name ?? "",
      email: user.email,
      phone: user.phone ?? "",
      address: user.address ?? "",
      city: user.city ?? "",
      pincode: user.pincode ?? "",
    });
    setStage("checkout");
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: lines.map((l) => ({
            slug: l.slug,
            name: l.product.name,
            mode: l.mode,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
          })),
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push("/login?next=/cart");
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Could not place order");
      clear();
      setPlacedId(data.order.id as string);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Section tone="cream" className="pt-28">
      <div className="flex items-end justify-between">
        <h1 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
          <MaskReveal>{stage === "cart" ? "Your cart" : "Checkout"}</MaskReveal>
        </h1>
        {stage === "cart" ? (
          <button
            type="button"
            onClick={clear}
            className="text-sm text-charcoal/60 underline-offset-4 hover:text-gold hover:underline"
          >
            Clear cart
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setStage("cart")}
            className="text-sm text-charcoal/60 underline-offset-4 hover:text-gold hover:underline"
          >
            ← Back to cart
          </button>
        )}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        {/* Left column: line items (cart) or shipping form (checkout) */}
        {stage === "cart" ? (
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
        ) : (
          <form
            id="checkout-form"
            onSubmit={placeOrder}
            className="rounded-2xl bg-white p-6 ring-1 ring-charcoal/10"
          >
            <h2 className="font-display text-xl font-bold">Shipping details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
                value={form.customerName}
                onChange={(v) => update("customerName", v)}
                autoComplete="name"
                className="sm:col-span-2"
              />
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => update("email", v)}
                autoComplete="email"
              />
              <Field
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={(v) => update("phone", v)}
                autoComplete="tel"
              />
              <Field
                label="Address"
                value={form.address}
                onChange={(v) => update("address", v)}
                autoComplete="street-address"
                className="sm:col-span-2"
              />
              <Field
                label="City"
                value={form.city}
                onChange={(v) => update("city", v)}
                autoComplete="address-level2"
              />
              <Field
                label="PIN code"
                value={form.pincode}
                onChange={(v) => update("pincode", v)}
                autoComplete="postal-code"
                inputMode="numeric"
              />
            </div>
            {error && (
              <p className="mt-4 text-sm font-medium text-red-700">{error}</p>
            )}
          </form>
        )}

        {/* Right column: order summary + primary action */}
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
              <dd className={shipping === 0 ? "font-medium text-green-700" : ""}>
                {shipping === 0 ? "Free" : formatINR(shipping)}
              </dd>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-charcoal/50">
                Free shipping on orders over {formatINR(FREE_SHIPPING_THRESHOLD)}.
              </p>
            )}
          </dl>
          <div className="mt-5 flex justify-between border-t border-charcoal/15 pt-5">
            <span className="font-display text-lg font-bold">Total</span>
            <span className="font-display text-lg font-bold">
              {formatINR(total)}
            </span>
          </div>

          {stage === "cart" ? (
            <>
              <Button size="lg" className="mt-6 w-full" onClick={goToCheckout}>
                {user ? "Proceed to checkout" : "Sign in to checkout"}
              </Button>
              {!user && (
                <p className="mt-2 text-center text-xs text-charcoal/55">
                  You&apos;ll need an account to place an order.
                </p>
              )}
              <ButtonLink
                href="/shop"
                variant="secondary"
                className="mt-3 w-full"
              >
                Keep shopping
              </ButtonLink>
            </>
          ) : (
            <Button
              type="submit"
              form="checkout-form"
              size="lg"
              className="mt-6 w-full"
              disabled={submitting}
            >
              {submitting ? "Placing order…" : "Place order"}
            </Button>
          )}
        </aside>
      </div>
    </Section>
  );
}

/** Labelled text input used on the checkout form. */
function Field({
  label,
  value,
  onChange,
  type = "text",
  className = "",
  ...rest
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type" | "className"
>) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-charcoal/70">
        {label}
      </span>
      <input
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-charcoal/20 bg-cream/40 px-3 py-2.5 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
        {...rest}
      />
    </label>
  );
}
