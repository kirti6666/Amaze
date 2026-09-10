import crypto from "node:crypto";

const BASE_URL = "https://payplus.live";
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
  const result = await response.json();
  if (!response.ok || result.success !== true || !result.data) {
    throw new Error("PayPlus request failed");
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
