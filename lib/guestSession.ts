import { SignJWT, jwtVerify } from "jose";

/**
 * Guest sessions.
 *
 * A guest who has verified their phone gets a short-lived signed token in an
 * httpOnly cookie. It is NOT a login: it carries no user id, grants no access
 * to account pages, and expires in 30 minutes — long enough to finish paying,
 * short enough that a shared or public computer doesn't leave a usable token.
 *
 * Order routes accept EITHER a real user session OR this token. Because it's
 * signed with the same secret as access tokens, the phone number inside it
 * cannot be forged by the client — which matters, since that phone is what a
 * guest later uses to look up their order.
 */

if (!process.env.JWT_ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET must be set in .env.local");
}

const SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
const GUEST_TOKEN_EXPIRY = "30m";

export const GUEST_TOKEN_COOKIE = "guestSession";

export type GuestChannel = "sms" | "email";

export interface GuestPayload {
  /** Exactly one is present, depending on the channel used to verify. */
  phone?: string;
  email?: string;
  /** Discriminator so a guest token can never be mistaken for an access token. */
  kind: "guest";
}

/**
 * Signs a guest session for a verified identifier.
 *
 * Accepts a bare phone string for backwards compatibility with the original
 * SMS-only call sites, or an object when the channel is email.
 */
export async function signGuestToken(
  identity: string | { phone?: string; email?: string }
): Promise<string> {
  const payload =
    typeof identity === "string" ? { phone: identity } : identity;

  return await new SignJWT({ ...payload, kind: "guest" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(GUEST_TOKEN_EXPIRY)
    .sign(SECRET);
}

export async function verifyGuestToken(token: string): Promise<GuestPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    // Reject anything that isn't explicitly a guest token, so a leaked or
    // mis-sent access token can't be used to place an order as a guest.
    if (payload.kind !== "guest") return null;
    const phone = typeof payload.phone === "string" ? payload.phone : undefined;
    const email = typeof payload.email === "string" ? payload.email : undefined;
    // A token with neither identifier proves nothing and must not be honoured.
    if (!phone && !email) return null;
    return { phone, email, kind: "guest" };
  } catch {
    return null;
  }
}

export const guestCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 30, // 30 minutes, matches GUEST_TOKEN_EXPIRY
};

/** Indian mobile numbers: 10 digits starting 6-9, with optional +91 / 0 prefix. */
export function normalisePhone(input: string): string | null {
  const digits = String(input ?? "").replace(/\D/g, "");
  const local = digits.startsWith("91") && digits.length === 12
    ? digits.slice(2)
    : digits.startsWith("0") && digits.length === 11
      ? digits.slice(1)
      : digits;
  return /^[6-9]\d{9}$/.test(local) ? local : null;
}


/** Lowercased and trimmed, with a deliberately permissive shape check. */
export function normaliseEmail(input: string): string | null {
  const email = String(input ?? "").trim().toLowerCase();
  // Not RFC-complete on purpose: over-strict email regexes reject valid
  // addresses. Deliverability is proved by the code arriving, not by the regex.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return null;
  return email;
}
