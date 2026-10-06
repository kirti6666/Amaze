"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";

const TOPICS = ["Order status", "Returns & refunds", "Cancel an order", "Product question", "Payment issue", "Other"];

/**
 * Posts to /api/contact. If the store's email isn't configured (or sending
 * fails) the API says so, and the form shows the direct contact details
 * instead of claiming the message was sent.
 */
export function ContactForm({ fallbackEmail, fallbackPhone }: { fallbackEmail?: string; fallbackPhone?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setStatus("sending");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const direct = [fallbackEmail && `email ${fallbackEmail}`, fallbackPhone && `call ${fallbackPhone}`].filter(Boolean).join(" or ");
        setError(`${json.error || "Something went wrong."}${direct ? ` Please ${direct}.` : " Please try again later."}`);
        setStatus("idle");
        return;
      }
      form.reset();
      setStatus("sent");
    } catch {
      setError("Couldn't reach the server. Please check your connection and try again.");
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <div className="contact-sent" role="status">
        <CheckCircle2 size={36} aria-hidden="true" />
        <h3>Thanks — your message is on its way</h3>
        <p>We will reply to your email as soon as we can. Keep an eye on your inbox (and spam folder).</p>
        <button type="button" onClick={() => setStatus("idle")}>Send another message</button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <div className="contact-row">
        <label>
          <span>Your name *</span>
          <input name="name" required minLength={2} maxLength={100} autoComplete="name" />
        </label>
        <label>
          <span>Email *</span>
          <input name="email" type="email" required maxLength={200} autoComplete="email" />
        </label>
      </div>
      <div className="contact-row">
        <label>
          <span>Phone</span>
          <input name="phone" type="tel" maxLength={20} autoComplete="tel" />
        </label>
        <label>
          <span>Order number</span>
          <input name="orderNumber" maxLength={40} placeholder="If it's about an order" />
        </label>
      </div>
      <label>
        <span>What can we help with? *</span>
        <select name="topic" required defaultValue="">
          <option value="" disabled>Choose a topic</option>
          {TOPICS.map((t) => <option key={t}>{t}</option>)}
        </select>
      </label>
      <label>
        <span>Message *</span>
        <textarea name="message" required minLength={10} maxLength={3000} rows={5} />
      </label>
      {/* Honeypot — invisible to people, tempting to bots. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="contact-hp" />

      {error && <p className="contact-error" role="alert">{error}</p>}

      <button type="submit" disabled={status === "sending"}>
        <Send size={16} aria-hidden="true" />
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
