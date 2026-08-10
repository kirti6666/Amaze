import { NextRequest } from "next/server";
import { Address } from "@/models";
import { requireAuth, type CurrentUser } from "@/lib/middleware/requireAuth";
import {
  verifyGuestToken,
  GUEST_TOKEN_COOKIE,
  normalisePhone,
} from "@/lib/guestSession";

/**
 * Who is placing this order, and where is it going?
 *
 * Both checkout routes (COD-era /api/orders and the Razorpay create-order)
 * needed the same two answers, and getting either subtly different between them
 * is how you end up with orders that skip a validation one path enforces. So
 * the logic lives here once.
 *
 * Two identities are accepted:
 *  - `user`  — a real session (NextAuth or the JWT cookie), as before.
 *  - `guest` — a verified phone, proved by the signed guest token that
 *              /api/auth/otp/verify sets. No account, no password, 30 minutes.
 *
 * The guest phone is read from the *signed token*, never from the request body.
 * That distinction is the whole security model: a client can put any phone
 * number in a JSON payload, but it cannot forge a token signed with
 * JWT_ACCESS_SECRET. The number attached to the order is therefore always one
 * that someone demonstrably received an SMS on — which is what makes a guest
 * order traceable, and what a guest later uses to look the order up.
 */

export interface GuestContactInput {
  name: string;
  phone: string;
  email?: string;
}

export interface ResolvedShipping {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export type CheckoutIdentity =
  | { kind: "user"; user: CurrentUser }
  // Exactly one identifier is present, depending on the channel used to verify.
  | { kind: "guest"; phone?: string; email?: string };

/**
 * Does this order belong to this guest?
 *
 * Matching is on whichever identifier the token actually carries. An
 * email-verified guest is matched on email, an SMS-verified one on phone —
 * never on a field the token doesn't vouch for, which would let anyone claim
 * an order by guessing a phone number.
 */
export function guestOwnsOrder(
  orderGuest: { phone?: string; email?: string } | undefined | null,
  identity: { phone?: string; email?: string }
): boolean {
  if (!orderGuest) return false;
  if (identity.email && orderGuest.email) {
    return orderGuest.email.toLowerCase() === identity.email.toLowerCase();
  }
  if (identity.phone && orderGuest.phone) {
    return orderGuest.phone === identity.phone;
  }
  return false;
}

/** Returns null when neither a session nor a valid guest token is present. */
export async function resolveCheckoutIdentity(
  req: NextRequest
): Promise<CheckoutIdentity | null> {
  const user = await requireAuth(req);
  if (user) return { kind: "user", user };

  const token = req.cookies.get(GUEST_TOKEN_COOKIE)?.value;
  if (token) {
    const payload = await verifyGuestToken(token);
    if (payload) {
      return { kind: "guest", phone: payload.phone, email: payload.email };
    }
  }

  return null;
}

/** Message shown when the guest token is missing or has aged out mid-checkout. */
export const IDENTITY_REQUIRED_MESSAGE =
  "Please verify your contact details to place this order.";

const STATE_MIN = 2;

function blank(v: unknown): boolean {
  return typeof v !== "string" || v.trim().length === 0;
}

/**
 * Resolves the shipping address.
 *
 * Logged-in users pass an `addressId` from their saved book, exactly as before.
 * Guests have no address book, so they post the fields inline and we validate
 * them here — the same shape either way, so downstream code doesn't branch.
 *
 * Returns a string on failure (the message to send back) rather than throwing,
 * matching how the surrounding route handlers already report errors.
 */
export async function resolveShippingAddress(
  identity: CheckoutIdentity,
  body: { addressId?: string; shippingAddress?: Partial<ResolvedShipping> }
): Promise<{ address: ResolvedShipping } | { error: string; status: number }> {
  if (identity.kind === "user") {
    if (!body.addressId) {
      return { error: "Please select a shipping address", status: 400 };
    }
    const address = await Address.findById(body.addressId);
    if (!address || address.user.toString() !== identity.user.id) {
      return { error: "Address not found", status: 404 };
    }
    return {
      address: {
        fullName: address.fullName,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      },
    };
  }

  const a = body.shippingAddress;
  if (!a) {
    return { error: "Please enter a delivery address", status: 400 };
  }

  if (blank(a.fullName)) return { error: "Please enter the recipient's full name", status: 400 };
  if (blank(a.line1)) return { error: "Please enter the address", status: 400 };
  if (blank(a.city)) return { error: "Please enter the city", status: 400 };
  if (blank(a.state) || (a.state as string).trim().length < STATE_MIN) {
    return { error: "Please enter the state", status: 400 };
  }
  if (!/^\d{6}$/.test(String(a.pincode ?? "").trim())) {
    return { error: "Please enter a valid 6-digit PIN code", status: 400 };
  }

  // The delivery phone may legitimately differ from the verified one (ordering
  // for a parent, sending to an office). We accept that, but the *order* stays
  // attached to the verified number, not this one.
  const deliveryPhone = normalisePhone(a.phone ?? "") ?? identity.phone ?? "";

  return {
    address: {
      fullName: (a.fullName as string).trim(),
      phone: deliveryPhone,
      line1: (a.line1 as string).trim(),
      line2: typeof a.line2 === "string" && a.line2.trim() ? a.line2.trim() : undefined,
      city: (a.city as string).trim(),
      state: (a.state as string).trim(),
      pincode: String(a.pincode).trim(),
    },
  };
}

/**
 * The `user` / `guest` fields to spread into Order.create().
 *
 * The Order model's pre-validate hook requires exactly one of them to be set,
 * so building this in one place keeps that invariant from being re-derived
 * (and eventually got wrong) at each call site.
 */
export function orderOwnerFields(
  identity: CheckoutIdentity,
  address: ResolvedShipping,
  contact?: GuestContactInput
): Record<string, unknown> {
  if (identity.kind === "user") {
    return { user: identity.user.id };
  }
  // The verified identifier always wins over anything typed into the form —
  // that's the one the server vouched for, and the one order lookup matches on.
  const typedEmail =
    contact?.email && contact.email.trim() ? contact.email.trim().toLowerCase() : undefined;

  return {
    guest: {
      // Falls back to the delivery name so the field is never empty.
      name: contact?.name?.trim() || address.fullName,
      // Phone: verified one if SMS was used, otherwise the delivery number.
      phone: identity.phone ?? address.phone,
      email: identity.email ?? typedEmail,
    },
  };
}
