import type { Product } from "@/types";

/*
  Local product seed.

  This is the ONLY place product data lives today. To move to a real backend or
  CMS later, replace the array below with an async fetch and turn the helpers at
  the bottom into async functions (e.g. `getProductBySlug` -> `await fetch(...)`).
  Every consumer already goes through these helpers, so call sites won't change.
*/
export const products: Product[] = [
  {
    slug: "high-voltage-espresso",
    name: "High Voltage Espresso",
    type: "hot",
    shortDesc: "Intense, full-bodied concentrate built for hot cups.",
    longDesc:
      "Our darkest, boldest concentrate. High Voltage is roasted for punch. Think ristretto intensity you can stretch into a flat white or an Americano. Add hot water for a jolt that actually wakes you up, or steam in milk for a thunderous latte.",
    priceINR: 499,
    cupsPerBottle: 20,
    sizeMl: 500,
    strength: 5,
    imagePlaceholder: "gold",
    badges: ["Bestseller"],
  },
  {
    slug: "midnight-cold-brew",
    name: "Midnight Cold Brew",
    type: "cold-brew",
    shortDesc: "Smooth, low-acid cold brew concentrate. Just add water or milk.",
    longDesc:
      "Steeped slow and cold for 18 hours, Midnight is our flagship concentrate. Mellow, chocolatey, and impossibly smooth. Pour an ounce over ice, top with water or milk, and you've got café-grade cold brew in ten seconds flat. No machine, no queue, no ₹300 bill.",
    priceINR: 449,
    cupsPerBottle: 18,
    sizeMl: 500,
    strength: 4,
    imagePlaceholder: "charcoal",
    badges: ["Bestseller"],
  },
  {
    slug: "golden-hour-vanilla",
    name: "Golden Hour Vanilla",
    type: "flavoured",
    shortDesc: "Cold brew concentrate kissed with real Madagascar vanilla.",
    longDesc:
      "Golden Hour blends our smooth cold brew base with real vanilla, no syrupy aftertaste, just warmth. Perfect over ice with a splash of milk for a dessert-leaning afternoon cup that still tastes like coffee first.",
    priceINR: 479,
    cupsPerBottle: 16,
    sizeMl: 500,
    strength: 3,
    imagePlaceholder: "gold",
    badges: ["New"],
  },
  {
    slug: "estate-reserve-single-origin",
    name: "Estate Reserve Single-Origin",
    type: "hot",
    shortDesc: "Estate-direct Chikmagalur beans, concentrated.",
    longDesc:
      "A small-batch concentrate from a single estate in Chikmagalur. Bright, fruit-forward, and clean. This is the one for people who taste tasting notes. Best enjoyed hot and black so the origin sings.",
    priceINR: 549,
    cupsPerBottle: 15,
    sizeMl: 500,
    strength: 4,
    imagePlaceholder: "charcoal",
    badges: ["Limited"],
  },
  {
    slug: "spiced-jolt-masala",
    name: "Spiced Jolt Masala",
    type: "flavoured",
    shortDesc: "Concentrate with cardamom, ginger and a warm spice backbone.",
    longDesc:
      "Spiced Jolt leans into Indian kitchens: cardamom, ginger, and a whisper of cinnamon folded into a robust coffee base. Add hot milk for a coffee-masala hybrid that drinks like a hug, or keep it black for something more bracing.",
    priceINR: 469,
    cupsPerBottle: 17,
    sizeMl: 500,
    strength: 3,
    imagePlaceholder: "gold",
    badges: ["New"],
  },
  {
    slug: "decaf-after-dark",
    name: "Decaf After Dark",
    type: "cold-brew",
    shortDesc: "All the smoothness, none of the 2 a.m. wakefulness.",
    longDesc:
      "Swiss-water decaffeinated and cold-steeped, After Dark gives you the full Midnight experience without the caffeine. The evening cup, the second cup, the I-just-like-coffee cup. Same jolt of flavour, none of the jitters.",
    priceINR: 399,
    cupsPerBottle: 18,
    sizeMl: 500,
    strength: 2,
    imagePlaceholder: "charcoal",
    badges: [],
  },
];

/** All products. Async-ready: callers `await` nothing today, but can later. */
export function getAllProducts(): Product[] {
  return products;
}

/** Look up one SKU by slug. Returns `undefined` for unknown slugs. */
export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

/** Hand-picked SKUs for the home page "Featured" row. */
export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.badges.includes("Bestseller")).slice(0, 3);
}

/** Format a rupee amount the Indian way (e.g. ₹1,499). */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
