"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ExternalLink, RefreshCw } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export function PayplusPayment({ orderId, total, paymentUrl }: { orderId: string; total: number; paymentUrl: string }) {
  const router = useRouter();
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const busy = useRef(false);
  const done = useRef(false);
  const check = useCallback(async () => {
    if (busy.current || done.current) return;
    busy.current = true;
    setChecking(true);
    try {
      const res = await fetch("/api/payments/payplus/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to check payment.");
      setError("");
      setStatus(data.status);
      if (data.status === "paid") {
        done.current = true;
        try {
          const cart = useCartStore.getState();
          const snapshot = sessionStorage.getItem(`payplus-cart:${orderId}`);
          if (snapshot === JSON.stringify(cart.items)) cart.clearCart();
          sessionStorage.removeItem(`payplus-cart:${orderId}`);
        } catch { /* A storage restriction must not prevent the confirmation page. */ }
        router.replace(`/order-success/${orderId}`);
      }
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to check payment."); }
    finally { busy.current = false; setChecking(false); }
  }, [orderId, router]);

  useEffect(() => {
    void check();
    const started = Date.now();
    const timer = setInterval(() => {
      if (Date.now() - started > 10 * 60 * 1000) { clearInterval(timer); return; }
      if (!document.hidden) void check();
    }, 15000);
    const onFocus = () => void check();
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(timer); window.removeEventListener("focus", onFocus); };
  }, [check]);

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <div className="rounded-2xl border border-hairline bg-surface p-6 sm:p-8 space-y-6">
        <ShieldCheck className="text-primary" size={36} />
        <div>
          <p className="text-xs uppercase tracking-widest text-muted">Secure checkout · PayPlus</p>
          <h1 className="mt-2 text-3xl font-bold">Complete your payment</h1>
          <p className="mt-3 text-muted">Pay on the secure PayPlus page, then return here. We will check your payment and confirm your order.</p>
        </div>
        <div className="border-y border-hairline py-4 flex justify-between items-center">
          <span>Total to pay</span><strong className="text-2xl">₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
        </div>
        <p className="text-xs text-muted">Order reference: <span className="font-mono">{orderId}</span></p>
        <div role="status" aria-live="polite" className="rounded-lg border border-hairline p-3 text-sm">
          {status === "paid" ? "Payment confirmed. Opening your order…" : status === "failed" ? "PayPlus reports this payment failed or was cancelled. If money was deducted, contact the store before trying again." : "Awaiting payment confirmation"}
        </div>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        {status === "pending" && <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground">Open PayPlus <ExternalLink size={16} /></a>}
        <button onClick={() => void check()} disabled={checking} className="flex w-full items-center justify-center gap-2 rounded-lg border border-hairline px-4 py-3 text-sm disabled:opacity-50"><RefreshCw size={16} className={checking ? "animate-spin" : ""} />{checking ? "Checking payment…" : "I’ve paid — check status"}</button>
        <p className="text-xs text-muted">Payment confirmation can take a moment. If you have already paid, please do not pay again.</p>
        <Link href="/cart" className="inline-block text-sm text-muted underline">Back to cart</Link>
      </div>
    </main>
  );
}
