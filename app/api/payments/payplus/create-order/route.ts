import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Order, Product, Coupon } from "@/models";
import { resolveCheckoutIdentity, resolveShippingAddress, orderOwnerFields } from "@/lib/checkoutIdentity";
import { getSiteSettings } from "@/lib/site-settings";
import { isPayplusConfigured, payplusRequest, validPayplusUrl, PayplusGatewayError } from "@/lib/payplus";

const cartSchema = z.object({
  items: z.array(z.object({
    productId: z.string().regex(/^[a-f\d]{24}$/i),
    quantity: z.number().int().min(1).max(1000),
    variant: z.record(z.string(), z.string()).optional(),
  })).min(1).max(100),
  couponCode: z.string().max(100).optional(),
  addressId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
  shippingAddress: z.object({
    fullName: z.string(), phone: z.string(), line1: z.string(), line2: z.string().optional(),
    city: z.string(), state: z.string(), pincode: z.string(),
  }).optional(),
  contact: z.object({ name: z.string(), phone: z.string(), email: z.string().optional() }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const identity = await resolveCheckoutIdentity(req);
    if (!identity) return NextResponse.json({ error: "Please sign in or verify your contact details." }, { status: 401 });
    if (!isPayplusConfigured()) return NextResponse.json({ error: "Online payments are not available yet. Please try again later." }, { status: 503 });
    const parsed = cartSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Please check your cart and delivery details." }, { status: 400 });
    const body = parsed.data;
    await connectDB();
    const { commerce } = await getSiteSettings();
    if (!commerce.payplusEnabled || commerce.currencyCode !== "INR") {
      return NextResponse.json({ error: "Online payments are currently unavailable." }, { status: 503 });
    }
    const resolved = await resolveShippingAddress(identity, body);
    if ("error" in resolved) return NextResponse.json({ error: resolved.error }, { status: resolved.status });

    // Merge duplicate product/variant rows before validating stock.
    const merged = new Map<string, typeof body.items[number]>();
    for (const item of body.items) {
      const key = item.productId + JSON.stringify(Object.entries(item.variant ?? {}).sort());
      const previous = merged.get(key);
      merged.set(key, { ...item, quantity: item.quantity + (previous?.quantity ?? 0) });
    }
    const orderItems = [];
    let subtotal = 0;
    for (const item of merged.values()) {
      const product = await Product.findById(item.productId);
      if (!product?.isActive) return NextResponse.json({ error: "An item is no longer available." }, { status: 400 });
      let price = product.discountPrice ?? product.price;
      let stock = product.stock;
      if (product.variants.length) {
        const combo = product.variantCombinations.find((c: any) => product.variants.every((v: any) => c.combination.get(v.name) === item.variant?.[v.name]));
        if (!combo) return NextResponse.json({ error: `Select valid options for ${product.title}.` }, { status: 400 });
        price = combo.price ?? price;
        stock = combo.stock;
      }
      if (item.quantity > stock) return NextResponse.json({ error: `Not enough stock for ${product.title}.` }, { status: 400 });
      subtotal += price * item.quantity;
      orderItems.push({ product: product._id, title: product.title, price, quantity: item.quantity, image: product.images?.[0], variant: item.variant });
    }
    let discount = 0;
    let couponCode: string | undefined;
    if (body.couponCode) {
      const coupon = await Coupon.findOne({ code: body.couponCode.trim().toUpperCase() });
      if (!coupon?.isActive || coupon.expiresAt < new Date() || (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) || subtotal < coupon.minOrderValue) {
        return NextResponse.json({ error: "This coupon is no longer available. Remove it and try again." }, { status: 400 });
      }
      discount = coupon.discountType === "percent" ? Math.round(subtotal * coupon.value / 100) : Math.min(coupon.value, subtotal);
      couponCode = coupon.code;
    }
    const shippingFee = subtotal - discount >= commerce.freeShippingThreshold ? 0 : commerce.shippingFee;
    const total = Math.round((subtotal - discount + shippingFee) * 100) / 100;
    if (!Number.isFinite(total) || total <= 0) return NextResponse.json({ error: "Invalid order total." }, { status: 400 });
    const order = await Order.create({
      ...orderOwnerFields(identity, resolved.address, body.contact), items: orderItems,
      shippingAddress: resolved.address, subtotal, discount, couponCode, shippingFee, total,
      paymentMethod: "payplus", paymentStatus: "pending", orderStatus: "placed",
    });
    const payment = await payplusRequest("create", { amount: total, merchantOrderId: String(order._id) });
    if (!payment.orderId || payment.merchantOrderId !== String(order._id) || !validPayplusUrl(payment.paymentUrl)) throw new Error("Invalid PayPlus response");
    order.payplusOrderId = payment.orderId;
    order.payplusPaymentUrl = payment.paymentUrl;
    await order.save();
    return NextResponse.json({ orderId: String(order._id) });
  } catch (error) {
    console.error("PayPlus create-order failed:", error instanceof Error ? error.message : "Unknown error");
    if (error instanceof PayplusGatewayError) {
      return NextResponse.json({ error: error.publicMessage, code: error.code }, { status: error.status });
    }
    return NextResponse.json({ error: "Unable to start payment. Please try again shortly." }, { status: 502 });
  }
}
