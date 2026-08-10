import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { Otp } from "@/models";
import {
  normalisePhone,
  normaliseEmail,
  signGuestToken,
  GUEST_TOKEN_COOKIE,
  guestCookieOptions,
} from "@/lib/guestSession";

/**
 * Verifies a phone OTP and issues a guest session.
 *
 * This is not a login. Success returns a signed, httpOnly, 30-minute token that
 * proves one thing — this browser controls this phone number — which is exactly
 * what an order needs to be attributable and traceable without an account.
 *
 * Brute-force defence, in layers:
 *  - only the newest unconsumed code for a number is considered, so requesting
 *    a fresh code invalidates older ones rather than widening the guess space;
 *  - `attempts` is capped at MAX_ATTEMPTS and incremented before the comparison,
 *    so a failed request always costs the attacker a try;
 *  - the code is consumed on success, so a correct code can't be replayed;
 *  - comparison is timing-safe.
 *
 * Wrong code, expired code and no-code-at-all all return the same message. A
 * distinct "no code found" reply would let someone probe which numbers have a
 * checkout in progress.
 */

const MAX_ATTEMPTS = 5;
const GENERIC_FAILURE = "That code isn't right, or it has expired. Please request a new one.";

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { phone: rawPhone, email: rawEmail, code: rawCode } = await req.json();

    // One channel per request. Email is the one that works without DLT
    // registration, so it's the default path while SMS approval is pending.
    const email = rawEmail ? normaliseEmail(rawEmail) : null;
    const phone = rawEmail ? null : normalisePhone(rawPhone);

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Enter a valid email address or 10-digit mobile number." },
        { status: 400 }
      );
    }

    const code = String(rawCode ?? "").replace(/\D/g, "");
    if (code.length !== 6) {
      return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });
    }

    await connectDB();

    // Newest unconsumed, unexpired code only.
    const otp = await Otp.findOne({
      ...(email ? { email } : { phone }),
      consumedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otp) {
      return NextResponse.json({ error: GENERIC_FAILURE }, { status: 400 });
    }

    if (otp.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "Too many incorrect attempts. Please request a new code." },
        { status: 429 }
      );
    }

    // Count the attempt before comparing, so an abandoned request still costs one.
    otp.attempts += 1;
    await otp.save();

    const provided = hashCode(code);
    const expected = otp.codeHash;
    const match =
      provided.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));

    if (!match) {
      const remaining = MAX_ATTEMPTS - otp.attempts;
      return NextResponse.json(
        {
          error:
            remaining > 0
              ? `${GENERIC_FAILURE} ${remaining} attempt${remaining === 1 ? "" : "s"} left.`
              : "Too many incorrect attempts. Please request a new code.",
        },
        { status: 400 }
      );
    }

    // Single use.
    otp.consumedAt = new Date();
    await otp.save();

    const token = await signGuestToken(email ? { email } : { phone: phone! });

    const res = NextResponse.json({
      verified: true,
      phone,
      email,
      // The client shows a countdown so the session doesn't expire silently
      // while someone is still filling in their address.
      expiresInSeconds: guestCookieOptions.maxAge,
    });
    res.cookies.set(GUEST_TOKEN_COOKIE, token, guestCookieOptions);
    return res;
  } catch (err) {
    console.error("OTP verify error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
