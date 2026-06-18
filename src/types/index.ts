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
