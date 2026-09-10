import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { verifyPayplusSignature, validPayplusUrl, matchesPayplusPayment, payplusRequest, PayplusGatewayError } from "../lib/payplus";

test("PayPlus amount limits and credential failures produce safe, specific errors", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.PAYPLUS_API_KEY;
  process.env.PAYPLUS_API_KEY = "test-only-key";
  try {
    globalThis.fetch = (async () => new Response(JSON.stringify({ success: false, message: "Amount outside merchant pay-in limits" }), { status: 422 })) as typeof fetch;
    await assert.rejects(payplusRequest("create", { amount: 1, merchantOrderId: "test" }), (error: unknown) => error instanceof PayplusGatewayError && error.code === "AMOUNT_OUTSIDE_LIMITS" && error.status === 422 && /payment limits/.test(error.publicMessage));
    globalThis.fetch = (async () => new Response(JSON.stringify({ success: false, message: "Private account details" }), { status: 401 })) as typeof fetch;
    await assert.rejects(payplusRequest("create", { amount: 1, merchantOrderId: "test" }), (error: unknown) => error instanceof PayplusGatewayError && error.code === "GATEWAY_ACCESS_DENIED" && !error.publicMessage.includes("Private account"));
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.PAYPLUS_API_KEY;
    else process.env.PAYPLUS_API_KEY = originalKey;
  }
});

test("webhooks require an exact valid HMAC of the original bytes", () => {
  const body = '{"event":"payin.success"}';
  const secret = "test-webhook-secret";
  const signature = crypto.createHmac("sha256", secret).update(body).digest("hex");
  assert.equal(verifyPayplusSignature(body, signature, secret), true);
  assert.equal(verifyPayplusSignature(body + " ", signature, secret), false);
  assert.equal(verifyPayplusSignature(body, "invalid", secret), false);
  assert.equal(verifyPayplusSignature(body, null, secret), false);
  assert.equal(verifyPayplusSignature(body, signature, ""), false);
});

test("checkout URLs cannot redirect customers to another host", () => {
  assert.equal(validPayplusUrl("https://payplus.live/pay/ORD_123"), true);
  for (const url of ["javascript:alert(1)", "https://payplus.live.evil.test/pay/123", "https://evil.test/pay/123", "http://payplus.live/pay/123", "https://name:secret@payplus.live/pay/123"]) assert.equal(validPayplusUrl(url), false);
});

test("payment proof must match both order ids and the gross amount", () => {
  const order = { _id: "local123", payplusOrderId: "ORD_123", total: 100.25 };
  const payment = { merchantOrderId: "local123", orderId: "ORD_123", amount: "100.25", status: "success" };
  assert.equal(matchesPayplusPayment(payment, order), true);
  for (const change of [{ amount: "95.25" }, { amount: undefined }, { amount: "garbage" }, { merchantOrderId: "other" }, { orderId: "other" }]) assert.equal(matchesPayplusPayment({ ...payment, ...change }, order), false);
});

test("concurrent confirmations update stock and coupons exactly once; pending and mismatched payments do not", async () => {
  // A unique disposable database on the local preview replica set. No real gateway requests.
  process.env.MONGODB_URI = `mongodb://127.0.0.1:27018/payplus_test_${crypto.randomBytes(8).toString("hex")}`;
  process.env.PAYPLUS_API_KEY = "test-only-key";
  const { connectDB } = await import("../lib/db");
  const { Order, Product, Coupon } = await import("../models");
  const { reconcilePayplusPayment } = await import("../lib/confirmPayplusPayment");
  const db = await connectDB();
  const { applyFreeShipping, DEFAULT_SETTINGS } = await import("../lib/site-settings");
  const settings = applyFreeShipping({ ...DEFAULT_SETTINGS, commerce: { ...DEFAULT_SETTINGS.commerce, shippingFee: 49, freeShippingThreshold: 1999 } });
  assert.equal(settings.commerce.shippingFee, 0);
  assert.equal(settings.commerce.freeShippingThreshold, 0);
  const originalFetch = globalThis.fetch;
  let gatewayStatus = "processing";
  let amount = "100";
  try {
    await Promise.all([Order.init(), Product.init(), Coupon.init()]);
    const productId = new db.Types.ObjectId();
    await Product.collection.insertOne({ _id: productId, title: "Payment test item", stock: 10, variants: [], variantCombinations: [] });
    await Coupon.collection.insertOne({ code: "TEST", usedCount: 0 });
    const order = await Order.create({ guest: { name: "Test", phone: "+919000000000" }, items: [{ product: productId, title: "Test", quantity: 2, price: 50 }], shippingAddress: { fullName: "Test", phone: "+919000000000", line1: "Test address", city: "Test city", state: "Test state", pincode: "110001" }, subtotal: 100, total: 100, paymentMethod: "payplus", paymentStatus: "pending", couponCode: "TEST", payplusOrderId: "ORD_TEST" });
    globalThis.fetch = (async (url: any) => {
      assert.equal(String(url), "https://payplus.live/api/v1/payin/status");
      return new Response(JSON.stringify({ success: true, data: { merchantOrderId: String(order._id), orderId: "ORD_TEST", status: gatewayStatus, amount } }), { status: 200 });
    }) as typeof fetch;
    assert.equal(await reconcilePayplusPayment(String(order._id)), "pending");
    assert.equal((await Product.findById(productId)).stock, 10);
    gatewayStatus = "success";
    amount = "99";
    await assert.rejects(reconcilePayplusPayment(String(order._id)), /mismatch/);
    assert.equal((await Order.findById(order._id)).paymentStatus, "pending");
    amount = "100";
    assert.deepEqual(await Promise.all([reconcilePayplusPayment(String(order._id)), reconcilePayplusPayment(String(order._id))]), ["paid", "paid"]);
    assert.equal((await Product.findById(productId)).stock, 8);
    assert.equal((await Coupon.findOne({ code: "TEST" })).usedCount, 1);
    assert.equal((await Order.findById(order._id)).paymentStatus, "paid");
    assert.equal(await reconcilePayplusPayment(String(order._id)), "paid");
    assert.equal((await Product.findById(productId)).stock, 8);
  } finally {
    globalThis.fetch = originalFetch;
    await db.connection.dropDatabase();
    await db.disconnect();
  }
});
