import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email";
import { getSiteSettings } from "@/lib/site-settings";

/**
 * Contact form → email to the store. The message goes to the contact email in
 * Site Settings (falling back to CONTACT_EMAIL), with Reply-To set to the
 * shopper so the store can answer straight from its inbox.
 *
 * If email isn't set up, this returns 503 rather than pretending to succeed,
 * so the form can tell the shopper to reach the store another way instead of
 * their message silently vanishing.
 */
export const dynamic = "force-dynamic";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(200),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  orderNumber: z.string().trim().max(40).optional().or(z.literal("")),
  topic: z.string().trim().max(60),
  message: z.string().trim().min(10, "Please write a little more").max(3000),
  // Honeypot: hidden from people, filled in by bots.
  website: z.string().max(0).optional().or(z.literal("")),
});

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    // A filled honeypot means a bot — answer as if it worked and drop it.
    if ((body as { website?: string })?.website) return NextResponse.json({ ok: true });
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the form" }, { status: 400 });
  }
  const d = parsed.data;

  const { contact, brand } = await getSiteSettings();
  const to = contact.email || process.env.CONTACT_EMAIL || "";
  if (!to) {
    return NextResponse.json({ error: "Our contact form isn't available right now." }, { status: 503 });
  }

  const rows: [string, string][] = [
    ["Name", d.name],
    ["Email", d.email],
    ["Phone", d.phone || "—"],
    ["Order number", d.orderNumber || "—"],
    ["Topic", d.topic],
  ];
  const html = `
    <h2>New message from the ${escapeHtml(brand.storeName)} contact form</h2>
    <table cellpadding="6" style="border-collapse:collapse">
      ${rows.map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${escapeHtml(v)}</td></tr>`).join("")}
    </table>
    <p style="white-space:pre-wrap">${escapeHtml(d.message)}</p>`;

  const sent = await sendEmail({
    to,
    subject: `[Contact] ${d.topic} — ${d.name}`,
    html,
    replyTo: d.email,
  });
  if (!sent) {
    return NextResponse.json({ error: "We couldn't send your message right now." }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
