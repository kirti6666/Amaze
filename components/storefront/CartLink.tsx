"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/useCartStore";

export function CartLink() {
  // Avoids a hydration mismatch: the persisted cart only exists in the
  // browser, so the item count is 0 on the server-rendered HTML and only
  // becomes accurate after the client mounts and reads localStorage.
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((s) => s.items);

  useEffect(() => setMounted(true), []);

  const count = mounted ? items.reduce((sum, i) => sum + i.quantity, 0) : 0;

  return (
    <Link href="/cart" className="hover:underline">
      Cart{count > 0 ? ` (${count})` : ""}
    </Link>
  );
}
