import { NextResponse } from "next/server";
import { createOrder, listOrders, type NewOrderInput } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin";
import { currentUser } from "@/lib/auth";
import { getProductBySlug } from "@/data/products";
import type { OrderItem } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/orders — list all orders (admin only). */
export function GET(req: Request) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ orders: listOrders() });
}

function asString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/**
 * POST /api/orders — place an order. Requires a signed-in user; the order is
 * linked to their account. The line `name` is snapshotted from the catalog;
 * unknown slugs are rejected.
 */
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Please sign in to place an order" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const customer = {
    customerName: asString(b.customerName),
    email: asString(b.email),
    phone: asString(b.phone),
    address: asString(b.address),
    city: asString(b.city),
    pincode: asString(b.pincode),
  };

  const missing = Object.entries(customer)
    .filter(([, v]) => v === "")
    .map(([k]) => k);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 },
    );
  }

  const rawItems = Array.isArray(b.items) ? b.items : [];
  const items: OrderItem[] = [];
  for (const raw of rawItems) {
    const it = raw as Record<string, unknown>;
    const slug = asString(it.slug);
    const product = getProductBySlug(slug);
    const quantity = Math.floor(Number(it.quantity));
    const unitPrice = Math.round(Number(it.unitPrice));
    const mode = it.mode === "subscribe" ? "subscribe" : "once";
    if (!product || !Number.isFinite(quantity) || quantity <= 0) continue;
    if (!Number.isFinite(unitPrice) || unitPrice < 0) continue;
    items.push({ slug, name: product.name, mode, quantity, unitPrice });
  }

  if (items.length === 0) {
    return NextResponse.json(
      { error: "Order has no valid items" },
      { status: 400 },
    );
  }

  const input: NewOrderInput = { userId: user.id, ...customer, items };
  const order = createOrder(input);
  return NextResponse.json({ order }, { status: 201 });
}
