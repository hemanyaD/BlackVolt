/**
 * Customer order-cancellation policy — the single source of truth shared by the
 * account UI (to show/enable the Cancel button + countdown) and the server route
 * (to authorize the cancel). Pure module, safe on client and server.
 *
 * A customer may cancel their own order only while BOTH hold:
 *   1. it hasn't progressed past "packed" (can't cancel once shipped), and
 *   2. it's still within the cancellation window after it was placed.
 * Admins can still cancel any order at any time from the admin dashboard.
 */
import type { Order, OrderStatus } from "@/types";

/** How long after placing an order a customer can self-cancel (1 hour). */
export const ORDER_CANCEL_WINDOW_MS = 60 * 60 * 1000;

/** Statuses a customer is still allowed to cancel from. */
export const CUSTOMER_CANCELLABLE_STATUSES: OrderStatus[] = [
  "received",
  "packed",
];

/** Timestamp (ms) after which self-cancellation is no longer allowed. */
export function cancelDeadline(createdAtISO: string): number {
  return new Date(createdAtISO).getTime() + ORDER_CANCEL_WINDOW_MS;
}

/** Whether the customer can cancel this order right now. */
export function canCustomerCancel(
  order: Pick<Order, "status" | "createdAt">,
  now: number = Date.now(),
): boolean {
  return (
    CUSTOMER_CANCELLABLE_STATUSES.includes(order.status) &&
    now < cancelDeadline(order.createdAt)
  );
}

/** Milliseconds left in the window (0 once it has elapsed). */
export function cancelMsRemaining(
  createdAtISO: string,
  now: number = Date.now(),
): number {
  return Math.max(0, cancelDeadline(createdAtISO) - now);
}
