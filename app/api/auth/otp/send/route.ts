import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { Otp } from "@/models";
import { normalisePhone } from "@/lib/guestSession";
import { sendOtpSms, isConsoleSmsTransport } from "@/lib/sms";
import { sendEmail } from "@/lib/email";
import { normaliseEmail } from "@/lib/guestSession";
import { otpEmail } from "@/lib/emailTemplates";

/** Codes live 5 minutes — long enough to switch apps and read an SMS. */
const OTP_TTL_MS = 5 * 60 * 1000;
/** Per number, per window. */
const MAX_PER_PHONE = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000;
/** Across all numbers from one IP — catches someone scripting the endpoint. */
const MAX_PER_IP = 20;
/** Stops a "resend" button from being hammered into an SMS bill. */
const RESEND_COOLDOWN_MS = 45 * 1000;

function hashCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  try {
    const { phone: rawPhone, email: rawEmail } = await req.json();

    // Email is the channel that works without DLT registration, so it's what a
    // store can launch on. SMS stays available for when approval comes through.
    const email = rawEmail ? normaliseEmail(rawEmail) : null;
    const phone = rawEmail ? null : normalisePhone(rawPhone);

    if (rawEmail && !email) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Enter a valid 10-digit Indian mobile number" },
        { status: 400 }
      );
    }

    await connectDB();

    const now = Date.now();
    const windowStart = new Date(now - RATE_WINDOW_MS);
    const ip = clientIp(req);

    // Cooldown first — the most common case is an impatient resend tap.
    const identifierQuery = email ? { email } : { phone };
    const latest = await Otp.findOne(identifierQuery).sort({ createdAt: -1 }).lean();
    if (latest) {
      const since = now - new Date((latest as any).createdAt).getTime();
      if (since < RESEND_COOLDOWN_MS) {
        return NextResponse.json(
          {
            error: `Please wait ${Math.ceil((RESEND_COOLDOWN_MS - since) / 1000)}s before requesting another code`,
          },
          { status: 429 }
        );
      }
    }

    const [phoneCount, ipCount] = await Promise.all([
      Otp.countDocuments({ ...identifierQuery, createdAt: { $gte: windowStart } }),
      ip === "unknown"
        ? Promise.resolve(0)
        : Otp.countDocuments({ requestIp: ip, createdAt: { $gte: windowStart } }),
    ]);

    if (phoneCount >= MAX_PER_PHONE || ipCount >= MAX_PER_IP) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    // crypto.randomInt, not Math.random — this guards money.
    const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");

    // Any earlier unconsumed codes for this number stop working immediately,
    // so only the newest SMS is ever valid.
    await Otp.updateMany(
      { ...identifierQuery, consumedAt: { $exists: false } },
      { $set: { consumedAt: new Date() } }
    );

    await Otp.create({
      ...identifierQuery,
      channel: email ? "email" : "sms",
      codeHash: hashCode(code),
      expiresAt: new Date(now + OTP_TTL_MS),
      requestIp: ip === "unknown" ? undefined : ip,
    });

    if (email) {
      // sendEmail swallows its own errors and logs to console when SMTP isn't
      // configured, so the code is still visible to a developer in dev.
      await sendEmail({
        to: email,
        subject: `${code} is your verification code`,
        html: otpEmail(code),
      });
    } else {
      const result = await sendOtpSms(phone!, code);
      if (!result.ok) {
        return NextResponse.json(
          { error: "Couldn't send the code right now. Please try again." },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      expiresInSeconds: OTP_TTL_MS / 1000,
      // Lets the checkout UI tell a developer to look in their terminal, rather
      // than waiting for an SMS that is never coming. Never exposes the code.
      channel: email ? "email" : "sms",
      // True when the code went to a server log rather than a real inbox or
      // handset, so the UI can tell a tester where to look.
      devMode: email ? !process.env.EMAIL_SERVER_HOST : isConsoleSmsTransport(),
    });
  } catch (err) {
    console.error("OTP send error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
