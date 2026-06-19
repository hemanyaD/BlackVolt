"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Section } from "@/components/Section";
import { Button, ButtonLink } from "@/components/Button";
import { formatINR } from "@/data/products";
import {
  ORDER_STATUS_LABELS,
  type Order,
  type OrderStatus,
  type User,
} from "@/types";
import { useUser } from "@/context/UserContext";
import { canCustomerCancel, cancelMsRemaining } from "@/lib/orders";

const STATUS_STYLES: Record<OrderStatus, string> = {
  received: "bg-charcoal/10 text-charcoal",
  packed: "bg-blue-100 text-blue-800",
  shipped: "bg-amber-100 text-amber-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout } = useUser();

  // Gate: bounce to login if not signed in.
  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/account");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <Section tone="cream" className="min-h-[70vh] pt-28">
        <p className="text-charcoal/50">Loading…</p>
      </Section>
    );
  }

  return (
    <Section tone="cream" className="min-h-[80vh] pt-28">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
            Your account
          </h1>
          <p className="mt-2 text-charcoal/60">
            Signed in as {user.email}
          </p>
        </div>
        <button
          type="button"
          onClick={async () => {
            await logout();
            router.push("/");
          }}
          className="text-sm text-charcoal/60 underline-offset-4 hover:text-gold hover:underline"
        >
          Sign out
        </button>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <ProfileForm user={user} />
        <OrderHistory />
      </div>
    </Section>
  );
}

function ProfileForm({ user }: { user: User }) {
  const { updateProfile } = useUser();
  const [form, setForm] = useState({
    name: user.name ?? "",
    phone: user.phone ?? "",
    address: user.address ?? "",
    city: user.city ?? "",
    pincode: user.pincode ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateProfile(form);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={save}
      className="h-fit rounded-2xl bg-white p-6 ring-1 ring-charcoal/10"
    >
      <h2 className="font-display text-xl font-bold">Profile &amp; shipping</h2>
      <p className="mt-1 text-sm text-charcoal/55">
        Saved here, prefilled at checkout.
      </p>
      <div className="mt-5 space-y-4">
        <Field label="Full name" value={form.name} onChange={(v) => update("name", v)} />
        <Field
          label="Phone"
          value={form.phone}
          onChange={(v) => update("phone", v)}
          type="tel"
        />
        <Field
          label="Address"
          value={form.address}
          onChange={(v) => update("address", v)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Field label="City" value={form.city} onChange={(v) => update("city", v)} />
          <Field
            label="PIN code"
            value={form.pincode}
            onChange={(v) => update("pincode", v)}
            inputMode="numeric"
          />
        </div>
      </div>
      {error && <p className="mt-4 text-sm font-medium text-red-700">{error}</p>}
      <Button type="submit" className="mt-5 w-full" disabled={saving}>
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save details"}
      </Button>
    </form>
  );
}

function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/my-orders");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not load orders");
        if (!cancelled) setOrders(data.orders as Order[]);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Could not load orders");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function cancelOrder(id: string) {
    if (
      !window.confirm("Cancel this order? Items will be returned to stock.")
    )
      return;
    setCancellingId(id);
    setCancelError(null);
    try {
      const res = await fetch(`/api/my-orders/${id}/cancel`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not cancel order");
      setOrders((prev) => prev.map((o) => (o.id === id ? (data.order as Order) : o)));
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Could not cancel order");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold">Order history</h2>
      {cancelError && (
        <p className="mt-3 text-sm font-medium text-red-700">{cancelError}</p>
      )}
      {loading ? (
        <p className="mt-4 text-charcoal/50">Loading orders…</p>
      ) : error ? (
        <p className="mt-4 text-sm text-red-700">{error}</p>
      ) : orders.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-white p-6 ring-1 ring-charcoal/10">
          <p className="text-charcoal/60">No orders yet.</p>
          <ButtonLink href="/shop" className="mt-4">
            Shop the concentrate
          </ButtonLink>
        </div>
      ) : (
        <ul className="mt-4 space-y-4">
          {orders.map((o) => {
            const canCancel = canCustomerCancel(o);
            const minsLeft = Math.ceil(cancelMsRemaining(o.createdAt) / 60000);
            const windowPassed =
              !canCancel &&
              (o.status === "received" || o.status === "packed");
            return (
            <li
              key={o.id}
              className="rounded-2xl bg-white p-5 ring-1 ring-charcoal/10"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold">{o.id}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[o.status]}`}
                  >
                    {ORDER_STATUS_LABELS[o.status]}
                  </span>
                </div>
                <span className="font-display font-bold">
                  {formatINR(o.total)}
                </span>
              </div>
              <p className="mt-1 text-xs text-charcoal/55">
                {new Date(o.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <ul className="mt-3 space-y-1 text-sm text-charcoal/80">
                {o.items.map((it, i) => (
                  <li key={i}>
                    {it.quantity} × {it.name}
                    {it.mode === "subscribe" && (
                      <span className="ml-1 text-xs text-gold">(subscription)</span>
                    )}
                  </li>
                ))}
              </ul>
              {o.status === "shipped" && o.trackingNumber && (
                <p className="mt-3 text-sm text-charcoal/70">
                  Tracking: <span className="font-medium">{o.carrier}</span> ·{" "}
                  {o.trackingNumber}
                </p>
              )}
              {canCancel && (
                <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-charcoal/10 pt-3">
                  <button
                    type="button"
                    onClick={() => cancelOrder(o.id)}
                    disabled={cancellingId === o.id}
                    className="rounded-full border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    {cancellingId === o.id ? "Cancelling…" : "Cancel order"}
                  </button>
                  <span className="text-xs text-charcoal/50">
                    Free cancellation for ~{minsLeft} more min
                  </span>
                </div>
              )}
              {windowPassed && (
                <p className="mt-3 border-t border-charcoal/10 pt-3 text-xs text-charcoal/45">
                  The cancellation window has passed — contact support for help.
                </p>
              )}
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-charcoal/70">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-charcoal/20 bg-cream/40 px-3 py-2.5 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
        {...rest}
      />
    </label>
  );
}
