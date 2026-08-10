import Razorpay from "razorpay";

/**
 * Razorpay client, created lazily.
 *
 * `new Razorpay()` throws immediately when key_id/key_secret are undefined.
 * If that ran at module scope, importing this file would crash — which is
 * exactly what happens during `next build`, when Next.js loads every route
 * module to collect page data. Builds would then fail on any deployment that
 * hasn't configured Razorpay yet, even though COD-only stores never call it.
 *
 * Creating the client inside a function defers that to the first real request,
 * so the build succeeds and only an actual payment attempt errors — with a
 * clear message rather than a stack trace.
 */
let client: Razorpay | null = null;

export function isRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function getRazorpay(): Razorpay {
  if (!isRazorpayConfigured()) {
    throw new Error(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET, or disable online payments in Admin → Settings → Commerce."
    );
  }
  if (!client) {
    client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });
  }
  return client;
}

export default getRazorpay;
