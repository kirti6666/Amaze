/**
 * SMS delivery for OTPs.
 *
 * Deliberately provider-agnostic. The store has no SMS gateway configured yet,
 * and hard-coding one would mean rewriting this when you pick a different
 * vendor — so the transport is chosen from env at call time.
 *
 * Transports:
 *   console  (default)  Prints the message to the terminal. Checkout is fully
 *                       testable with no vendor account: run the flow and read
 *                       the code out of your `npm run dev` output.
 *   msg91               Indian provider, cheapest for domestic volume.
 *   twilio              International, more expensive per SMS in India.
 *
 * Set SMS_PROVIDER to switch. Anything unrecognised falls back to console with
 * a warning rather than silently dropping the message, because a silently
 * undelivered OTP looks identical to a broken checkout from the customer's side.
 *
 * IMPORTANT for production: Indian SMS requires DLT registration (TRAI rules).
 * You register your sender ID and the exact template text with your operator
 * before transactional SMS will deliver. Budget a few days for approval.
 */

export interface SmsResult {
  ok: boolean;
  provider: string;
  error?: string;
}

async function sendViaMsg91(phone: string, otp: string): Promise<SmsResult> {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  if (!authKey || !templateId) {
    return { ok: false, provider: "msg91", error: "MSG91_AUTH_KEY or MSG91_TEMPLATE_ID missing" };
  }

  const res = await fetch("https://control.msg91.com/api/v5/otp", {
    method: "POST",
    headers: { "Content-Type": "application/json", authkey: authKey },
    body: JSON.stringify({
      template_id: templateId,
      mobile: `91${phone}`,
      otp,
    }),
  });

  if (!res.ok) {
    return { ok: false, provider: "msg91", error: `HTTP ${res.status}` };
  }
  return { ok: true, provider: "msg91" };
}

async function sendViaTwilio(phone: string, otp: string): Promise<SmsResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) {
    return { ok: false, provider: "twilio", error: "Twilio credentials missing" };
  }

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      To: `+91${phone}`,
      From: from,
      Body: `${otp} is your verification code. Do not share it with anyone.`,
    }),
  });

  if (!res.ok) {
    return { ok: false, provider: "twilio", error: `HTTP ${res.status}` };
  }
  return { ok: true, provider: "twilio" };
}

export async function sendOtpSms(phone: string, otp: string): Promise<SmsResult> {
  const provider = (process.env.SMS_PROVIDER || "console").toLowerCase();

  try {
    if (provider === "msg91") return await sendViaMsg91(phone, otp);
    if (provider === "twilio") return await sendViaTwilio(phone, otp);

    if (provider !== "console") {
      console.warn(`[sms] Unknown SMS_PROVIDER "${provider}" — falling back to console.`);
    }

    console.log(
      "\n──────────────────────────────────────────────\n" +
        `  OTP for +91 ${phone}:  ${otp}\n` +
        "  (console transport — set SMS_PROVIDER to send real SMS)\n" +
        "──────────────────────────────────────────────\n"
    );
    return { ok: true, provider: "console" };
  } catch (err) {
    // Never throw at the caller: a gateway outage should surface as a clean
    // "couldn't send, try again" rather than a 500 on the checkout page.
    console.error("[sms] send failed:", err);
    return { ok: false, provider, error: "Delivery failed" };
  }
}

/** True when OTPs are only printed locally — the checkout UI says so on screen. */
export function isConsoleSmsTransport(): boolean {
  const provider = (process.env.SMS_PROVIDER || "console").toLowerCase();
  return provider !== "msg91" && provider !== "twilio";
}
