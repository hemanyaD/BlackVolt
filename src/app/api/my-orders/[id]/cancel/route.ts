import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { getOrder, updateOrder } from "@/lib/db";
import {
  CUSTOMER_CANCELLABLE_STATUSES,
  canCustomerCancel,
} from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/my-orders/[id]/cancel — let a customer cancel their OWN order, but
 * only while it's within the cancellation window and hasn't shipped. Returns
 * items to stock (via updateOrder's restock-on-cancel).
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const { id } = await params;

  const order = getOrder(id);
  if (!order || order.userId !== user.id) {
    // Don't leak existence of other users' orders.
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status === "cancelled") {
    return NextResponse.json(
      { error: "This order is already cancelled" },
      { status: 409 },
    );
  }
  if (!canCustomerCancel(order)) {
    const message = CUSTOMER_CANCELLABLE_STATUSES.includes(order.status)
      ? "The cancellation window has passed. Contact support for help."
      : "This order has already shipped and can no longer be cancelled.";
    return NextResponse.json({ error: message }, { status: 409 });
  }

  const updated = updateOrder(id, { status: "cancelled" });
  return NextResponse.json({ order: updated });
}
