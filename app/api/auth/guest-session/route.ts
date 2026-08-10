import { NextRequest, NextResponse } from "next/server";
import {
  normalisePhone,
  signGuestToken,
  GUEST_TOKEN_COOKIE,
  guestCookieOptions,
} from "@/lib/guestSession";

/**
 * Issues a guest session from a phone number WITHOUT an OTP.
 *
 * Why this exists: SMS in India requires DLT registration, which takes days of
 * operator approval. Without it, no OTP can be delivered, and without an OTP no
 * guest can check out — so the store cannot open at all while paperwork clears.
 *
 * Why it's an acceptable trade for a PREPAID store specifically: the payment
 * itself is the verification. Someone who completes a real card or UPI payment
 * has proved far more than possession of a phone. The number here is only
 * contact detail for delivery and order lookup, not an authentication factor.
 *
 * Why it must NOT be left on for a COD store: with cash on delivery and no
 * verification, anyone can place unlimited orders against numbers they don't
 * own, and you pay the return shipping. If COD is ever re-enabled, turn this
 * off in the same change.
 *
 * Defaults to OFF. Set GUEST_OTP_REQUIRED=false in .env.local to enable it,
 * and delete that line once DLT clears — nothing else needs to change, because
 * the checkout panel falls back to the OTP flow whenever this route refuses.
 */

function otpRequired(): boolean {
  // Anything other than an explicit "false" keeps verification on, so a typo
  // fails closed rather than silently disabling a security control.
  return (process.env.GUEST_OTP_REQUIRED ?? "true").toLowerCase() !== "false";
}

/** Which verification channel is active. Email unless explicitly set to sms. */
function channel(): "email" | "sms" {
  return (process.env.OTP_CHANNEL ?? "email").toLowerCase() === "sms" ? "sms" : "email";
}

export async function GET() {
  // Lets the checkout UI decide which field to render before asking for anything.
  return NextResponse.json({ otpRequired: otpRequired(), channel: channel() });
}

export async function POST(req: NextRequest) {
  if (otpRequired()) {
    return NextResponse.json(
      { error: "Phone verification is required.", otpRequired: true },
      { status: 403 }
    );
  }

  try {
    const { phone: rawPhone } = await req.json();
    const phone = normalisePhone(rawPhone);

    if (!phone) {
      return NextResponse.json(
        { error: "Enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    const token = await signGuestToken(phone);

    const res = NextResponse.json({
      verified: true,
      phone,
      // Flagged so the order record and any future audit can distinguish
      // "verified by OTP" from "accepted unverified".
      otpSkipped: true,
      expiresInSeconds: guestCookieOptions.maxAge,
    });
    res.cookies.set(GUEST_TOKEN_COOKIE, token, guestCookieOptions);
    return res;
  } catch (err) {
    console.error("Guest session error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
