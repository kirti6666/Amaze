"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  title: string;
  slug: string;
  price: number; // unit price at time of adding (variant override or discountPrice/price)
  image?: string;
  quantity: number;
  variant?: Record<string, string>; // e.g. { Size: "M", Color: "Red" }
  maxStock: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variant?: Record<string, string>) => void;
  updateQuantity: (productId: string, quantity: number, variant?: Record<string, string>) => void;
  clearCart: () => void;
}

function sameLine(a: CartItem, productId: string, variant?: Record<string, string>) {
  if (a.productId !== productId) return false;
  const av = a.variant ?? {};
  const bv = variant ?? {};
  const keys = new Set([...Object.keys(av), ...Object.keys(bv)]);
  for (const k of keys) {
    if (av[k] !== bv[k]) return false;
  }
  return true;
}

// Note on storage: this uses localStorage via zustand's persist middleware.
// This is fine here — it's real application code shipped to the user's own
// browser, not a sandboxed preview artifact. Cart contents are non-sensitive.
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existing = get().items.find((i) => sameLine(i, item.productId, item.variant));
        if (existing) {
          set({
            items: get().items.map((i) =>
              sameLine(i, item.productId, item.variant)
                ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.maxStock) }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
      },

      removeItem: (productId, variant) => {
        set({ items: get().items.filter((i) => !sameLine(i, productId, variant)) });
      },

      updateQuantity: (productId, quantity, variant) => {
        set({
          items: get()
            .items.map((i) =>
              sameLine(i, productId, variant)
                ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
                : i
            )
            .filter((i) => i.quantity > 0),
        });
      },

      clearCart: () => set({ items: [] }),
    }),
    { name: "cart-storage" }
  )
);
