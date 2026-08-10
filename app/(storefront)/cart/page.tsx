"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useCurrency } from "@/lib/useCurrency";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const { symbol: currency } = useCurrency();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null; // avoid hydration mismatch with persisted localStorage cart

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Link href="/shop" className="text-primary underline">
          Continue shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.productId + JSON.stringify(item.variant ?? {})}
            className="flex gap-4 border rounded-md p-4"
          >
            <div className="w-20 h-20 rounded-md overflow-hidden bg-surface shrink-0">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              ) : null}
            </div>

            <div className="flex-1">
              <Link href={`/product/${item.slug}`} className="font-medium hover:underline">
                {item.title}
              </Link>
              {item.variant && Object.keys(item.variant).length > 0 && (
                <p className="text-xs text-muted mt-0.5">
                  {Object.entries(item.variant)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(", ")}
                </p>
              )}
              <p className="text-sm mt-1">{currency}{item.price}</p>

              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1, item.variant)
                    }
                    className="px-2 py-0.5"
                  >
                    −
                  </button>
                  <span className="px-3 text-sm">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1, item.variant)
                    }
                    className="px-2 py-0.5"
                    disabled={item.quantity >= item.maxStock}
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.productId, item.variant)}
                  className="text-xs text-danger hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="text-right font-medium">{currency}{item.price * item.quantity}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t pt-6 flex items-center justify-between">
        <span className="text-lg font-medium">Subtotal</span>
        <span className="text-lg font-bold">{currency}{subtotal}</span>
      </div>
      <p className="text-xs text-muted text-right">Shipping and discounts calculated at checkout</p>

      <Link
        href="/checkout"
        className="block text-center mt-6 rounded-md bg-primary text-primary-foreground py-3 font-medium"
      >
        Proceed to Checkout
      </Link>
    </main>
  );
}
