"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";

/**
 * Guest checkout identity + address.
 *
 * Replaces the saved-address picker for anyone without an account. Two stages:
 *
 *   1. Phone → OTP. The verified number is what the order is attached to, and
 *      what the buyer later uses to look their order up, since there's no
 *      account page to log into. The server issues a signed 30-minute token on
 *      success; this component never handles or trusts the number itself.
 *   2. Delivery address, revealed only after verification — asking for a full
 *      address before knowing the number is real invites junk orders.
 *
 * The address fields are deliberately NOT saved anywhere on the client. A guest
 * device is often shared, and silently persisting someone's home address for
 * the next person is not a trade worth making for one saved form-fill.
 *
 * Parent owns the data: every change is pushed up through `onChange` so the
 * checkout page can submit it, and `onVerified` flips the parent's gate.
 */

export interface GuestAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

export interface GuestContact {
  name: string;
  phone: string;
  email: string;
}

const EMPTY_ADDRESS: GuestAddress = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

const RESEND_SECONDS = 45;

export function GuestCheckoutPanel({
  onVerifiedChange,
  onAddressChange,
  onContactChange,
}: {
  onVerifiedChange: (verified: boolean) => void;
  onAddressChange: (address: GuestAddress) => void;
  onContactChange: (contact: GuestContact) => void;
}) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const [address, setAddress] = useState<GuestAddress>(EMPTY_ADDRESS);
  const [email, setEmail] = useState("");

  const codeRef = useRef<HTMLInputElement>(null);

  // Whether phone verification is enforced. When SMS isn't available yet
  // (GUEST_OTP_REQUIRED=false), the number is collected but not verified, so
  // the store can trade while DLT registration clears. Defaults to true so a
  // failed lookup errs on the side of verifying.
  const [otpRequired, setOtpRequired] = useState(true);
  /** "email" until DLT registration clears and SMS can actually be delivered. */
  const [channel, setChannel] = useState<"email" | "sms">("email");

  useEffect(() => {
    fetch("/api/auth/guest-session")
      .then((r) => r.json())
      .then((d) => {
        setOtpRequired(d.otpRequired !== false);
        if (d.channel === "sms" || d.channel === "email") setChannel(d.channel);
      })
      .catch(() => setOtpRequired(true));
  }, []);

  const isEmailChannel = channel === "email";
  /** The value the code is sent to — email or phone depending on channel. */
  const identifier = isEmailChannel ? email : phone;

  // Resend cooldown, mirroring the server's own 45s limit so the button
  // disables itself rather than letting people hit a 429.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    onAddressChange(address);
  }, [address, onAddressChange]);

  useEffect(() => {
    onContactChange({ name: address.fullName, phone, email });
  }, [address.fullName, phone, email, onContactChange]);

  function update<K extends keyof GuestAddress>(key: K, value: GuestAddress[K]) {
    setAddress((a) => ({ ...a, [key]: value }));
  }

  /** Skips OTP when the server allows it; falls back to the OTP flow if not. */
  async function continueWithoutOtp() {
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/auth/guest-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Server says verification is on after all — switch to OTP rather than
        // leaving the buyer stuck.
        if (data.otpRequired) {
          setOtpRequired(true);
          await sendOtp();
          return;
        }
        setError(data.error || "Could not continue. Please try again.");
        return;
      }
      setVerified(true);
      onVerifiedChange(true);
      setAddress((a) => ({ ...a, phone: a.phone || data.phone }));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function sendOtp() {
    setError("");
    setNotice("");
    setSending(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEmailChannel ? { email } : { phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not send the code. Please try again.");
        return;
      }
      setSent(true);
      setCooldown(RESEND_SECONDS);
      // The send route reports whether the console SMS transport is in use
      // (devMode). Surfacing it saves a tester waiting for an SMS that is
      // never coming. The code itself is never sent to the client.
      if (data.devMode) {
        setNotice(
          isEmailChannel
            ? "No SMTP configured yet — your 6-digit code has been printed in the terminal running `npm run dev`."
            : "No SMS gateway configured yet — your 6-digit code has been printed in the terminal running `npm run dev`."
        );
      }
      setTimeout(() => codeRef.current?.focus(), 50);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function verifyOtp() {
    setError("");
    setVerifying(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEmailChannel ? { email, code } : { phone, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "That code isn't right.");
        return;
      }
      setVerified(true);
      onVerifiedChange(true);
      setNotice("");
      // Pre-fill the delivery phone with the verified one; it stays editable
      // for people ordering to someone else's number.
      setAddress((a) => ({ ...a, phone: a.phone || data.phone }));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  const phoneLooksValid = /^[6-9]\d{9}$/.test(phone.replace(/\D/g, "").slice(-10));
  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  const identifierValid = isEmailChannel ? emailLooksValid : phoneLooksValid;

  return (
    <section className="space-y-6">
      {/* ── Stage 1: phone ───────────────────────────────────────────── */}
      <div>
        <h2 className="mb-1 text-lg font-semibold">
          {isEmailChannel ? "Your email address" : "Your mobile number"}
        </h2>
        <p className="mb-4 text-sm text-muted">
          {otpRequired
            ? `We'll send a 6-digit code to confirm it. No account needed — this is how you'll track your order.`
            : "No account needed — we'll use this to send order updates and to look your order up later."}
        </p>

        <div className="flex gap-2">
          {isEmailChannel ? (
            <input
              type="email"
              autoComplete="email"
              value={email}
              disabled={verified}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 rounded-md border border-hairline bg-transparent px-3 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-60"
            />
          ) : (
            <>
              <span className="dose flex items-center rounded-md border border-hairline px-3 text-sm text-muted">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
                value={phone}
                disabled={verified}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit mobile number"
                className="dose flex-1 rounded-md border border-hairline bg-transparent px-3 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-60"
              />
            </>
          )}
          {!verified && (
            <button
              type="button"
              onClick={otpRequired ? sendOtp : continueWithoutOtp}
              disabled={!identifierValid || sending || cooldown > 0}
              className="shrink-0 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {sending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : cooldown > 0 ? (
                `${cooldown}s`
              ) : sent ? (
                "Resend"
              ) : otpRequired ? (
                "Send code"
              ) : (
                "Continue"
              )}
            </button>
          )}
        </div>

        {/* ── Stage 1b: code ─────────────────────────────────────────── */}
        {sent && !verified && (
          <div className="mt-3 flex gap-2">
            <input
              ref={codeRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit code"
              className="dose flex-1 rounded-md border border-hairline bg-transparent px-3 py-2.5 text-sm tracking-[0.3em] outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={verifyOtp}
              disabled={code.length !== 6 || verifying}
              className="shrink-0 rounded-md border-2 border-primary px-4 py-2.5 text-sm font-medium text-primary disabled:opacity-50"
            >
              {verifying ? <Loader2 size={16} className="animate-spin" /> : "Verify"}
            </button>
          </div>
        )}

        {verified && (
          <p className="mt-3 flex items-center gap-2 text-sm text-success">
            <ShieldCheck size={16} />{" "}
            {otpRequired
              ? isEmailChannel
                ? "Email verified"
                : "Mobile number verified"
              : "Contact details saved"}
          </p>
        )}
        {notice && !verified && (
          <p className="mt-2 rounded-md border border-hairline bg-surface px-3 py-2 text-xs text-muted">
            {notice}
          </p>
        )}
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      </div>

      {/* ── Stage 2: address ─────────────────────────────────────────── */}
      {verified && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Delivery address</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={address.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="Full name"
              autoComplete="name"
              className="rounded-md border border-hairline bg-transparent px-3 py-2.5 text-sm outline-none focus:border-primary sm:col-span-2"
            />
            <input
              value={address.line1}
              onChange={(e) => update("line1", e.target.value)}
              placeholder="House / flat, street"
              autoComplete="address-line1"
              className="rounded-md border border-hairline bg-transparent px-3 py-2.5 text-sm outline-none focus:border-primary sm:col-span-2"
            />
            <input
              value={address.line2}
              onChange={(e) => update("line2", e.target.value)}
              placeholder="Area, landmark (optional)"
              autoComplete="address-line2"
              className="rounded-md border border-hairline bg-transparent px-3 py-2.5 text-sm outline-none focus:border-primary sm:col-span-2"
            />
            <input
              value={address.city}
              onChange={(e) => update("city", e.target.value)}
              placeholder="City"
              autoComplete="address-level2"
              className="rounded-md border border-hairline bg-transparent px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <input
              value={address.state}
              onChange={(e) => update("state", e.target.value)}
              placeholder="State"
              autoComplete="address-level1"
              className="rounded-md border border-hairline bg-transparent px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <input
              value={address.pincode}
              inputMode="numeric"
              maxLength={6}
              onChange={(e) => update("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit PIN code"
              autoComplete="postal-code"
              className="dose rounded-md border border-hairline bg-transparent px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={address.phone}
              onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="Delivery phone"
              className="dose rounded-md border border-hairline bg-transparent px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            {!isEmailChannel && (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email for receipt (optional)"
                autoComplete="email"
                className="rounded-md border border-hairline bg-transparent px-3 py-2.5 text-sm outline-none focus:border-primary sm:col-span-2"
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
