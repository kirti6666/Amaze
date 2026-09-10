import crypto from "node:crypto";

const BASE_URL = "https://payplus.live";
export class PayplusGatewayError extends Error {
  constructor(public code: string, public publicMessage: string, public status: number) {
    super(code);
    this.name = "PayplusGatewayError";
  }
}
export function isPayplusConfigured() {
  return Boolean(process.env.PAYPLUS_API_KEY?.trim());
}

export interface PayplusPayment {
  orderId: string;
  merchantOrderId: string;
  amount?: string | number;
  status: string;
  paymentUrl?: string;
  utr?: string;
}

export async function payplusRequest(endpoint: "create" | "status", body: Record<string, unknown>): Promise<PayplusPayment> {
  if (!isPayplusConfigured()) throw new Error("PayPlus is not configured");
  const response = await fetch(`${BASE_URL}/api/v1/payin/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": process.env.PAYPLUS_API_KEY!.trim() },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  let result;
  try { result = await response.json(); } catch {
    throw new PayplusGatewayError("INVALID_RESPONSE", "The payment provider is temporarily unavailable. Please try again shortly.", 502);
  }
  if (!response.ok || result.success !== true || !result.data) {
    // Map known provider failures to safe messages. Never expose raw provider
    // responses, which may contain account details, to the customer's browser.
    const reason = typeof result.message === "string" ? result.message : "";
    if (response.status === 422 && /amount outside merchant pay-in limits/i.test(reason)) {
      throw new PayplusGatewayError("AMOUNT_OUTSIDE_LIMITS", "This order amount is outside the payment limits set by PayPlus for this store. Please contact the store to confirm the allowed amount.", 422);
    }
    if (response.status === 401 || response.status === 403) {
      throw new PayplusGatewayError("GATEWAY_ACCESS_DENIED", "The store's payment provider is not available. Please contact the store.", 503);
    }
    throw new PayplusGatewayError("GATEWAY_REQUEST_FAILED", "The payment provider could not start this payment. Please try again shortly.", 502);
  }
  return result.data;
}

export function validPayplusUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.origin === BASE_URL && url.pathname.startsWith("/pay/") && !url.username && !url.password;
  } catch { return false; }
}

export function verifyPayplusSignature(raw: string, signature: string | null, secret: string) {
  if (!secret || !signature || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = crypto.createHmac("sha256", secret).update(raw).digest();
  return crypto.timingSafeEqual(expected, Buffer.from(signature, "hex"));
}

export function matchesPayplusPayment(payment: PayplusPayment, order: { _id: unknown; total: number; payplusOrderId?: string }) {
  const amount = payment.amount;
  return payment.merchantOrderId === String(order._id)
    && payment.orderId === order.payplusOrderId
    && (typeof amount === "string" || typeof amount === "number")
    && Number.isFinite(Number(amount))
    && Math.round(Number(amount) * 100) === Math.round(order.total * 100);
}
