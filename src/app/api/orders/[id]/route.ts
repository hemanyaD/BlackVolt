import { NextResponse } from "next/server";
import { deleteOrder, updateOrder, type OrderUpdate } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin";
import { ORDER_STATUSES, type OrderStatus } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** PATCH /api/orders/[id] — update logistics fields (admin only). */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;

  const patch: OrderUpdate = {};
  if (b.status !== undefined) {
    if (!ORDER_STATUSES.includes(b.status as OrderStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    patch.status = b.status as OrderStatus;
  }
  if (b.carrier !== undefined) {
    patch.carrier = b.carrier === null ? null : String(b.carrier).trim() || null;
  }
  if (b.trackingNumber !== undefined) {
    patch.trackingNumber =
      b.trackingNumber === null ? null : String(b.trackingNumber).trim() || null;
  }

  const updated = updateOrder(id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({ order: updated });
}

/** DELETE /api/orders/[id] — permanently remove an order (admin only). */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!deleteOrder(id)) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
