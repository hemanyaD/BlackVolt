"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { formatINR } from "@/data/products";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type InventoryRow,
  type Order,
  type OrderStatus,
} from "@/types";
import { adminFetch, clearAdminToken, getAdminToken } from "@/lib/admin-client";

export default function AdminDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [o, inv] = await Promise.all([
      adminFetch<{ orders: Order[] }>("/api/orders"),
      adminFetch<{ inventory: InventoryRow[] }>("/api/inventory"),
    ]);
    setOrders(o.orders);
    setInventory(inv.inventory);
  }, []);

  const reloadInventory = useCallback(async () => {
    const inv = await adminFetch<{ inventory: InventoryRow[] }>("/api/inventory");
    setInventory(inv.inventory);
  }, []);

  useEffect(() => {
    if (!getAdminToken()) {
      router.replace("/admin/login");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await load();
        if (!cancelled) setReady(true);
      } catch {
        // Stale/invalid token — bounce to login.
        if (cancelled) return;
        clearAdminToken();
        router.replace("/admin/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, load]);

  function logout() {
    clearAdminToken();
    router.replace("/admin/login");
  }

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-charcoal/50">
        Loading admin…
      </div>
    );
  }

  // ----- derived stats -----
  const activeOrders = orders.filter((o) => o.status !== "cancelled");
  const revenue = activeOrders.reduce((s, o) => s + o.total, 0);
  const toFulfill = orders.filter(
    (o) => o.status === "received" || o.status === "packed",
  ).length;
  const inTransit = orders.filter((o) => o.status === "shipped").length;
  const lowStock = inventory.filter((i) => i.stock <= i.lowStockThreshold);

  return (
    <div className="min-h-screen bg-bone pb-24">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-charcoal text-cream">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-gold">
              BlackVolt
            </p>
            <h1 className="font-display text-lg font-black uppercase tracking-tight">
              Admin
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => load().catch(() => setError("Refresh failed"))}
              className="text-sm text-cream/70 underline-offset-4 hover:text-gold hover:underline"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-cream/30 px-4 py-1.5 text-sm font-medium hover:border-gold hover:text-gold"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
        {error && (
          <p className="mb-6 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        {/* Stats */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <Stat label="Orders" value={String(orders.length)} />
          <Stat label="Revenue" value={formatINR(revenue)} />
          <Stat label="To fulfill" value={String(toFulfill)} accent={toFulfill > 0} />
          <Stat label="In transit" value={String(inTransit)} />
          <Stat
            label="Low stock"
            value={String(lowStock.length)}
            accent={lowStock.length > 0}
          />
        </section>

        {/* Orders + logistics */}
        <h2 className="mt-12 font-display text-2xl font-black uppercase tracking-tight">
          Orders &amp; logistics
        </h2>
        {orders.length === 0 ? (
          <p className="mt-4 text-charcoal/60">
            No orders yet. Place one from the storefront to see it here.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdated={(u) =>
                  setOrders((prev) => prev.map((o) => (o.id === u.id ? u : o)))
                }
                onDeleted={(id) =>
                  setOrders((prev) => prev.filter((o) => o.id !== id))
                }
                onRestock={reloadInventory}
                onError={setError}
              />
            ))}
          </div>
        )}

        {/* Inventory */}
        <h2 className="mt-14 font-display text-2xl font-black uppercase tracking-tight">
          Inventory
        </h2>
        <div className="mt-5 overflow-hidden rounded-2xl bg-white ring-1 ring-charcoal/10">
          <table className="w-full text-sm">
            <thead className="bg-charcoal/5 text-left text-xs uppercase tracking-wide text-charcoal/60">
              <tr>
                <th className="px-5 py-3 font-semibold">Product</th>
                <th className="px-5 py-3 font-semibold">Stock</th>
                <th className="px-5 py-3 font-semibold">Low at</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/10">
              {inventory.map((row) => (
                <InventoryRowEditor
                  key={row.slug}
                  row={row}
                  onUpdated={(u) =>
                    setInventory((prev) =>
                      prev.map((r) => (r.slug === u.slug ? u : r)),
                    )
                  }
                  onError={setError}
                />
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

/* ------------------------------- pieces -------------------------------- */

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 ring-1 ${
        accent
          ? "bg-gold/15 ring-gold/40"
          : "bg-white ring-charcoal/10"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/55">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-black tracking-tight">
        {value}
      </p>
    </div>
  );
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  received: "bg-charcoal/10 text-charcoal",
  packed: "bg-blue-100 text-blue-800",
  shipped: "bg-amber-100 text-amber-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function OrderCard({
  order,
  onUpdated,
  onDeleted,
  onRestock,
  onError,
}: {
  order: Order;
  onUpdated: (o: Order) => void;
  onDeleted: (id: string) => void;
  onRestock: () => void;
  onError: (msg: string) => void;
}) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [carrier, setCarrier] = useState(order.carrier ?? "");
  const [tracking, setTracking] = useState(order.trackingNumber ?? "");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);

  const dirty =
    status !== order.status ||
    carrier !== (order.carrier ?? "") ||
    tracking !== (order.trackingNumber ?? "");
  const isCancelled = order.status === "cancelled";
  const itemsSubtotal = order.total - order.shipping;

  async function save() {
    setSaving(true);
    try {
      const { order: updated } = await adminFetch<{ order: Order }>(
        `/api/orders/${order.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status,
            carrier: carrier.trim() || null,
            trackingNumber: tracking.trim() || null,
          }),
        },
      );
      onUpdated(updated);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Could not update order");
    } finally {
      setSaving(false);
    }
  }

  async function cancel() {
    if (!window.confirm(`Cancel order ${order.id} and return its items to stock?`))
      return;
    setBusy(true);
    try {
      const { order: updated } = await adminFetch<{ order: Order }>(
        `/api/orders/${order.id}`,
        { method: "PATCH", body: JSON.stringify({ status: "cancelled" }) },
      );
      setStatus(updated.status);
      onUpdated(updated);
      onRestock();
    } catch (e) {
      onError(e instanceof Error ? e.message : "Could not cancel order");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Permanently delete order ${order.id}? This can't be undone.`))
      return;
    setBusy(true);
    try {
      await adminFetch(`/api/orders/${order.id}`, { method: "DELETE" });
      onDeleted(order.id);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Could not delete order");
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-charcoal/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-display font-bold">{order.id}</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[order.status]}`}
            >
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>
          <p className="mt-1 text-xs text-charcoal/55">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <p className="font-display text-lg font-black">
          {formatINR(order.total)}
        </p>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* Customer + items */}
        <div>
          <p className="text-sm font-semibold">{order.customerName}</p>
          <p className="text-sm text-charcoal/60">
            {order.email} · {order.phone}
          </p>
          <p className="mt-1 text-sm text-charcoal/60">
            {order.address}, {order.city} {order.pincode}
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {order.items.map((it, i) => (
              <li key={i} className="flex justify-between gap-4">
                <span className="text-charcoal/80">
                  {it.quantity} × {it.name}
                  {it.mode === "subscribe" && (
                    <span className="ml-1 text-xs text-gold">(sub)</span>
                  )}
                </span>
                <span className="text-charcoal/60">
                  {formatINR(it.unitPrice * it.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1 border-t border-charcoal/10 pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-charcoal/60">Subtotal</dt>
              <dd>{formatINR(itemsSubtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-charcoal/60">Shipping</dt>
              <dd>
                {order.shipping === 0 ? "Free" : formatINR(order.shipping)}
              </dd>
            </div>
            <div className="flex justify-between font-bold">
              <dt>Total</dt>
              <dd>{formatINR(order.total)}</dd>
            </div>
          </dl>
        </div>

        {/* Logistics controls */}
        <div className="rounded-xl bg-bone p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/55">
            Fulfillment
          </p>
          <div className="mt-3 space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs text-charcoal/60">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full rounded-lg border border-charcoal/20 bg-white px-3 py-2 text-sm outline-none focus:border-gold"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {ORDER_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs text-charcoal/60">
                  Carrier
                </span>
                <input
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="e.g. Delhivery"
                  className="w-full rounded-lg border border-charcoal/20 bg-white px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-charcoal/60">
                  Tracking #
                </span>
                <input
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder="AWB number"
                  className="w-full rounded-lg border border-charcoal/20 bg-white px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </label>
            </div>
            <Button
              size="md"
              className="w-full"
              disabled={!dirty || saving}
              onClick={save}
            >
              {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
            </Button>
            <div className="flex items-center justify-between pt-1">
              {!isCancelled ? (
                <button
                  type="button"
                  onClick={cancel}
                  disabled={busy}
                  className="rounded-full border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                >
                  {busy ? "Working…" : "Cancel order"}
                </button>
              ) : (
                <span className="text-sm font-medium text-red-700">
                  Cancelled · stock returned
                </span>
              )}
              <button
                type="button"
                onClick={remove}
                disabled={busy}
                className="text-sm text-charcoal/50 underline-offset-4 hover:text-red-700 hover:underline disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InventoryRowEditor({
  row,
  onUpdated,
  onError,
}: {
  row: InventoryRow;
  onUpdated: (r: InventoryRow) => void;
  onError: (msg: string) => void;
}) {
  const [stock, setStock] = useState(String(row.stock));
  const [saving, setSaving] = useState(false);

  const parsed = Number(stock);
  const valid = Number.isFinite(parsed) && parsed >= 0;
  const dirty = valid && parsed !== row.stock;
  const isLow = row.stock <= row.lowStockThreshold;

  async function save() {
    if (!valid) return;
    setSaving(true);
    try {
      const { item } = await adminFetch<{ item: InventoryRow }>(
        `/api/inventory/${row.slug}`,
        { method: "PATCH", body: JSON.stringify({ stock: parsed }) },
      );
      onUpdated(item);
      setStock(String(item.stock));
    } catch (e) {
      onError(e instanceof Error ? e.message : "Could not update stock");
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr>
      <td className="px-5 py-3 font-medium">{row.name}</td>
      <td className="px-5 py-3">
        <input
          type="number"
          min={0}
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="w-24 rounded-lg border border-charcoal/20 bg-white px-3 py-1.5 text-sm outline-none focus:border-gold"
        />
      </td>
      <td className="px-5 py-3 text-charcoal/60">{row.lowStockThreshold}</td>
      <td className="px-5 py-3">
        {isLow ? (
          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
            Low stock
          </span>
        ) : (
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
            In stock
          </span>
        )}
      </td>
      <td className="px-5 py-3 text-right">
        <Button
          size="md"
          variant="secondary"
          disabled={!dirty || saving}
          onClick={save}
        >
          {saving ? "…" : "Save"}
        </Button>
      </td>
    </tr>
  );
}
