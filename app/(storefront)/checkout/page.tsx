"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { AddressForm } from "@/components/storefront/AddressForm";
import {
  GuestCheckoutPanel,
  type GuestAddress,
  type GuestContact,
} from "@/components/storefront/GuestCheckoutPanel";
import { AvailableCoupons } from "@/components/storefront/AvailableCoupons";

interface Address {
  _id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-checkout-js")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const [mounted, setMounted] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);
  // COD has been removed — the store is prepaid only, so there is no payment
  // method to choose between. Kept as a constant rather than deleted so the
  // create-order payload and the summary copy still read explicitly.
  const paymentMethod = "razorpay" as const;

  // Guest checkout. `isGuest` is decided by whether /api/addresses answers 401:
  // an account holder keeps the saved-address picker, everyone else verifies a
  // phone and types an address inline.
  const [isGuest, setIsGuest] = useState(false);
  const [guestVerified, setGuestVerified] = useState(false);
  const [guestAddress, setGuestAddress] = useState<GuestAddress | null>(null);
  const [guestContact, setGuestContact] = useState<GuestContact | null>(null);

  // Commerce config from Site Settings (shipping, currency, which payment
  // methods are enabled). Falls back to sensible defaults until it loads.
  const [commerce, setCommerce] = useState({
    currencySymbol: "₹",
    shippingFee: 49,
    freeShippingThreshold: 999,
    codEnabled: true,
    razorpayEnabled: true,
  });

  const [couponInput, setCouponInput] = useState("");
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");

  useEffect(() => setMounted(true), []);

  async function loadAddresses() {
    setAddressLoading(true);
    const res = await fetch("/api/addresses");
    if (res.status === 401) {
      // Not logged in. This used to bounce to /login — the single biggest
      // point of drop-off in the funnel. Now it just switches checkout into
      // guest mode: verify a phone, type an address, pay.
      setIsGuest(true);
      setAddressLoading(false);
      return;
    }
    const data = await res.json();
    const list: Address[] = data.addresses ?? [];
    setAddresses(list);
    const defaultAddr = list.find((a) => a.isDefault) ?? list[0];
    if (defaultAddr) setSelectedAddressId(defaultAddr._id);
    setShowAddressForm(list.length === 0);
    setAddressLoading(false);
  }

  useEffect(() => {
    loadAddresses();
    // Load commerce settings so shipping, currency, and payment options match admin config.
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings?.commerce) {
          const c = d.settings.commerce;
          setCommerce(c);
        }
      })
      .catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return null;

  const cur = commerce.currencySymbol;
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee =
    subtotal - discount >= commerce.freeShippingThreshold ? 0 : commerce.shippingFee;
  const total = Math.max(0, subtotal - discount + shippingFee);

  async function handleApplyCoupon(codeArg?: string) {
    setCouponError("");
    const code = (codeArg ?? couponInput).trim();
    if (!code) return;
    setCouponInput(code); // reflect one-tap selections in the input
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || "Invalid coupon");
        setDiscount(0);
        setCouponCode(null);
        return;
      }
      setDiscount(data.discount);
      setCouponCode(data.code);
    } catch {
      setCouponError("Something went wrong");
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setCouponCode(null);
    setDiscount(0);
    setCouponInput("");
    setCouponError("");
  }

  async function handlePlaceOrder() {
    setOrderError("");

    if (isGuest) {
      if (!guestVerified) {
        setOrderError("Please verify your mobile number first");
        return;
      }
      if (!guestAddress?.line1 || !guestAddress?.city || !guestAddress?.pincode) {
        setOrderError("Please complete your delivery address");
        return;
      }
    } else if (!selectedAddressId) {
      setOrderError("Please select a shipping address");
      return;
    }

    const checkoutItems = items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      variant: i.variant,
    }));

    // Razorpay flow
    setPlacing(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setOrderError("Failed to load the payment gateway. Please check your connection.");
        setPlacing(false);
        return;
      }

      const createRes = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: checkoutItems,
          // Account holders send a saved address id; guests send the fields
          // themselves. The server accepts exactly one of the two.
          ...(isGuest
            ? { shippingAddress: guestAddress, contact: guestContact }
            : { addressId: selectedAddressId }),
          couponCode: couponCode ?? undefined,
        }),
      });
      const createData = await createRes.json();

      if (!createRes.ok) {
        setOrderError(createData.error || "Failed to start payment");
        setPlacing(false);
        return;
      }

      const options = {
        key: createData.keyId,
        amount: createData.amount,
        currency: createData.currency,
        name: "Store",
        description: "Order Payment",
        order_id: createData.razorpayOrderId,
        prefill: createData.prefill,
        theme: { color: "#111827" },
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          try {
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: createData.orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              setOrderError(
                verifyData.error ||
                "Payment verification failed. If money was deducted, please contact support."
              );
              setPlacing(false);
              return;
            }

            clearCart();
            router.push(`/order-success/${createData.orderId}`);
          } catch {
            setOrderError(
              "Payment verification failed. If money was deducted, please contact support."
            );
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPlacing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function () {
        setOrderError("Payment failed. Please try again.");
        setPlacing(false);
      });
      rzp.open();
    } catch {
      setOrderError("Something went wrong. Please try again.");
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/shop"
            className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
          >
            Continue shopping
          </Link>
          <Link
            href="/"
            className="rounded-md border border-hairline px-6 py-3 text-sm font-medium"
          >
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-10">
      <div className="md:col-span-2 space-y-8">
        {isGuest ? (
          <GuestCheckoutPanel
            onVerifiedChange={setGuestVerified}
            onAddressChange={setGuestAddress}
            onContactChange={setGuestContact}
          />
        ) : (
        <section>
          <h2 className="font-bold text-lg mb-3">Shipping Address</h2>

          {addressLoading ? (
            <p className="text-muted text-sm">Loading addresses...</p>
          ) : (
            <div className="space-y-2">
              {addresses.map((addr) => (
                <label
                  key={addr._id}
                  className={`block border rounded-md p-3 text-sm cursor-pointer ${selectedAddressId === addr._id ? "border-primary" : ""
                    }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === addr._id}
                    onChange={() => setSelectedAddressId(addr._id)}
                    className="mr-2"
                  />
                  <span className="font-medium">{addr.fullName}</span> — {addr.phone}
                  <br />
                  <span className="text-muted">
                    {addr.line1}
                    {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} -{" "}
                    {addr.pincode}
                  </span>
                </label>
              ))}

              {!showAddressForm && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="text-sm text-primary underline"
                >
                  + Add a new address
                </button>
              )}

              {showAddressForm && (
                <AddressForm
                  onSaved={() => {
                    setShowAddressForm(false);
                    loadAddresses();
                  }}
                  onCancel={addresses.length > 0 ? () => setShowAddressForm(false) : undefined}
                />
              )}
            </div>
          )}
        </section>
        )}

        <section>
          <h2 className="font-bold text-lg mb-3">Payment</h2>
          {/* Prepaid only — COD was removed, so there's nothing to choose.
              Showing a single locked radio would imply a choice that isn't
              there; this states the method and the methods inside it. */}
          {commerce.razorpayEnabled ? (
            <div className="rounded-md border border-hairline p-4 text-sm">
              <p className="font-medium">Pay securely online</p>
              <p className="mt-1 text-muted">
                UPI, cards, netbanking and wallets — via Razorpay. Your order is
                confirmed the moment payment succeeds.
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-danger/40 bg-danger-bg/40 p-4 text-sm">
              <p className="font-medium text-danger">Online payment is unavailable</p>
              <p className="mt-1 text-muted">
                We can&apos;t take orders right now. Please try again shortly.
              </p>
            </div>
          )}
        </section>
      </div>

      <div className="space-y-4">
        <h2 className="font-bold text-lg">Order Summary</h2>

        <div className="border rounded-md p-4 space-y-3 text-sm">
          {items.map((item) => (
            <div
              key={item.productId + JSON.stringify(item.variant ?? {})}
              className="flex justify-between"
            >
              <span className="text-muted">
                {item.title} × {item.quantity}
              </span>
              <span>{cur}{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        <div>
          {couponCode ? (
            <div className="flex items-center justify-between text-sm bg-success-bg rounded-md p-2">
              <span>
                Coupon <strong>{couponCode}</strong> applied
              </span>
              <button onClick={removeCoupon} className="text-danger text-xs underline">
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                placeholder="Coupon code"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="flex-1 rounded-md border px-3 py-2 text-sm"
              />
            <button
                onClick={() => handleApplyCoupon()}
                disabled={couponLoading}
                className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          )}
          {couponError && <p className="text-xs text-danger mt-1">{couponError}</p>}

          <AvailableCoupons
            subtotal={subtotal}
            appliedCode={couponCode}
            onApply={(c) => handleApplyCoupon(c)}
          />
        </div>

        <div className="border-t pt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{cur}{subtotal}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount</span>
              <span>−{cur}{discount}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{shippingFee === 0 ? "Free" : `${cur}${shippingFee}`}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-1 border-t mt-1">
            <span>Total</span>
            <span>{cur}{total}</span>
          </div>
        </div>

        {orderError && <p className="text-sm text-danger">{orderError}</p>}

        <button
          onClick={handlePlaceOrder}
          disabled={placing || addressLoading}
          className="w-full rounded-md bg-primary text-primary-foreground py-3 font-medium disabled:opacity-50"
        >
          {placing
            ? paymentMethod === "razorpay"
              ? "Opening payment..."
              : "Placing order..."
            : paymentMethod === "razorpay"
              ? "Proceed to Pay"
              : "Place Order"}
        </button>
      </div>
    </main>
  );
}
