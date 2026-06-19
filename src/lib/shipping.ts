/**
 * Shipping policy — the single place delivery charges are defined.
 *
 * Flat fee per order, waived once the cart subtotal crosses the free-shipping
 * threshold. Used by both the cart summary (client) and order creation (server),
 * so the price the customer sees always matches what's persisted. Pure module —
 * safe to import from client and server.
 */

/** Subtotal (in rupees) at or above which shipping is free. */
export const FREE_SHIPPING_THRESHOLD = 999;

/** Flat shipping fee (in rupees) below the free-shipping threshold. */
export const FLAT_SHIPPING_FEE = 59;

/** Shipping charge for a given item subtotal, in rupees. */
export function shippingFor(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
}
