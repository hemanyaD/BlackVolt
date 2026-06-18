"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem, Product } from "@/types";
import { getProductBySlug } from "@/data/products";

const STORAGE_KEY = "blackvolt:cart:v1";

/** 10% off recurring orders — the only place subscription pricing is defined. */
export const SUBSCRIPTION_DISCOUNT = 0.1;

/** A cart line resolved against the product catalog, ready to render. */
export interface ResolvedCartLine extends CartItem {
  product: Product;
  /** Per-unit price after any subscription discount, rounded to rupees. */
  unitPrice: number;
  /** unitPrice × quantity. */
  lineTotal: number;
}

interface CartContextValue {
  items: CartItem[];
  lines: ResolvedCartLine[];
  /** Total number of bottles across all lines. */
  count: number;
  /** Sum of all line totals, in rupees. */
  subtotal: number;
  addItem: (slug: string, mode?: CartItem["mode"], quantity?: number) => void;
  removeItem: (slug: string, mode: CartItem["mode"]) => void;
  setQuantity: (slug: string, mode: CartItem["mode"], quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/** Two lines are "the same" only if both slug AND purchase mode match. */
function sameLine(a: CartItem, b: { slug: string; mode: CartItem["mode"] }) {
  return a.slug === b.slug && a.mode === b.mode;
}

function unitPriceFor(product: Product, mode: CartItem["mode"]): number {
  const price =
    mode === "subscribe"
      ? product.priceINR * (1 - SUBSCRIPTION_DISCOUNT)
      : product.priceINR;
  return Math.round(price);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted cart once, on mount (client only).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // Hydration-safe load: we intentionally start empty on the server and
      // populate from localStorage after mount to avoid an SSR/client mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      // Corrupt/unavailable storage — start with an empty cart.
    }
    setHydrated(true);
  }, []);

  // Persist on change, but only after the initial load to avoid clobbering it.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore quota / private-mode write failures.
    }
  }, [items, hydrated]);

  const addItem = useCallback(
    (slug: string, mode: CartItem["mode"] = "once", quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => sameLine(i, { slug, mode }));
        if (existing) {
          return prev.map((i) =>
            sameLine(i, { slug, mode })
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          );
        }
        return [...prev, { slug, mode, quantity }];
      });
    },
    [],
  );

  const removeItem = useCallback((slug: string, mode: CartItem["mode"]) => {
    setItems((prev) => prev.filter((i) => !sameLine(i, { slug, mode })));
  }, []);

  const setQuantity = useCallback(
    (slug: string, mode: CartItem["mode"], quantity: number) => {
      setItems((prev) =>
        quantity <= 0
          ? prev.filter((i) => !sameLine(i, { slug, mode }))
          : prev.map((i) =>
              sameLine(i, { slug, mode }) ? { ...i, quantity } : i,
            ),
      );
    },
    [],
  );

  const clear = useCallback(() => setItems([]), []);

  // Resolve lines against the catalog; drop any items whose SKU disappeared.
  const lines = useMemo<ResolvedCartLine[]>(() => {
    return items.flatMap((item) => {
      const product = getProductBySlug(item.slug);
      if (!product) return [];
      const unitPrice = unitPriceFor(product, item.mode);
      return [
        {
          ...item,
          product,
          unitPrice,
          lineTotal: unitPrice * item.quantity,
        },
      ];
    });
  }, [items]);

  const count = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines],
  );
  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.lineTotal, 0),
    [lines],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      lines,
      count,
      subtotal,
      addItem,
      removeItem,
      setQuantity,
      clear,
    }),
    [items, lines, count, subtotal, addItem, removeItem, setQuantity, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Access the cart. Throws if used outside <CartProvider>. */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
