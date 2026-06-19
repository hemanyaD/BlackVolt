/** Coffee concentrate categories used for shop filtering. */
export type ProductType = "cold-brew" | "hot" | "flavoured";

/** Marketing badges shown on product cards. */
export type ProductBadge = "Bestseller" | "New" | "Limited";

/**
 * A single SKU. This is the shape consumed across the site (shop grid, product
 * detail, cart). It is intentionally backend-agnostic — see `src/data/products.ts`
 * for how to swap the local seed for a real API/CMS later.
 */
export interface Product {
  slug: string;
  name: string;
  type: ProductType;
  shortDesc: string;
  longDesc: string;
  priceINR: number;
  cupsPerBottle: number;
  sizeMl: number;
  /** 1–5, relative roast/caffeine intensity shown on the detail page. */
  strength: number;
  /** Tailwind-ready accent for the placeholder image block. */
  imagePlaceholder: "gold" | "charcoal";
  badges: ProductBadge[];
}

/** A line in the cart: a product plus the chosen quantity and purchase mode. */
export interface CartItem {
  slug: string;
  quantity: number;
  /** One-time purchase vs. recurring monthly subscription. */
  mode: "once" | "subscribe";
}

/** Human-readable labels for each product type (used in filters and badges). */
export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  "cold-brew": "Cold Brew",
  hot: "Hot",
  flavoured: "Flavoured",
};

/* ------------------------------------------------------------------ *
 * Orders, logistics & inventory (admin backend)
 * ------------------------------------------------------------------ */

/** Fulfillment lifecycle of an order, in the order it progresses. */
export type OrderStatus =
  | "received"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

/** Canonical ordering of statuses for dropdowns / pipeline display. */
export const ORDER_STATUSES: OrderStatus[] = [
  "received",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
];

/** Human-readable labels for each order status. */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: "Received",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** A purchased line, snapshotted at checkout (price/name frozen at sale time). */
export interface OrderItem {
  slug: string;
  name: string;
  mode: CartItem["mode"];
  quantity: number;
  /** Per-unit price in rupees at the moment of sale. */
  unitPrice: number;
}

/** A customer order with its items and logistics fields. */
export interface Order {
  /** Human-friendly id, e.g. "BV-1A2B3C4D". */
  id: string;
  /** The account that placed the order (null for legacy/guest orders). */
  userId: string | null;
  /** ISO timestamp of when the order was placed. */
  createdAt: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  status: OrderStatus;
  /** Shipping carrier, set during fulfillment. */
  carrier: string | null;
  /** Tracking number, set during fulfillment. */
  trackingNumber: string | null;
  /** Shipping charge in rupees (0 when free). */
  shipping: number;
  /** Grand total in rupees (item subtotal + shipping). */
  total: number;
  items: OrderItem[];
}

/** A registered customer (never carries the password hash). */
export interface User {
  id: string;
  email: string;
  name: string | null;
  /** Saved shipping details — used to prefill checkout; all optional. */
  phone: string | null;
  address: string | null;
  city: string | null;
  pincode: string | null;
}

/** Stock level for one SKU, managed from the admin inventory table. */
export interface InventoryRow {
  slug: string;
  name: string;
  stock: number;
  /** At or below this, the SKU is flagged low in the admin. */
  lowStockThreshold: number;
}
