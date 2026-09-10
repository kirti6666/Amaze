import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";
import InvoiceSettings from "@/models/InvoiceSettings";
import { Order, User } from "@/models";
import {
  getInvoiceSettings,
  financialYearOf,
  type InvoiceSettingsData,
} from "./settings";

/* ------------------------------------------------------------------ *
 * Types — the frozen shape stored on Invoice.snapshot
 * ------------------------------------------------------------------ */

export interface InvoiceLine {
  index: number;
  title: string;
  variant: string;
  hsn: string;
  quantity: number;
  /** Per-unit price as charged (inclusive or exclusive per settings). */
  unitPrice: number;
  gross: number;
  discount: number;
  taxableValue: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  lineTotal: number;
}

export interface HsnSummaryRow {
  hsn: string;
  gstRate: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface InvoiceSnapshot {
  invoiceNumber: string;
  issuedAt: string;
  financialYear: string;

  seller: InvoiceSettingsData["seller"];
  bank: InvoiceSettingsData["bank"];
  document: InvoiceSettingsData["document"];
  taxConfig: {
    gstEnabled: boolean;
    pricesIncludeTax: boolean;
  };

  buyer: {
    name: string;
    email: string;
    phone: string;
    addressLines: string[];
    city: string;
    state: string;
    stateCode: string;
    pincode: string;
  };

  order: {
    id: string;
    shortId: string;
    placedAt: string;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
    couponCode: string;
    razorpayPaymentId: string;
  };

  placeOfSupply: string;
  isInterState: boolean;

  lines: InvoiceLine[];
  hsnSummary: HsnSummaryRow[];

  totals: {
    gross: number;
    discount: number;
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalTax: number;
    shippingFee: number;
    shippingTaxable: number;
    shippingTax: number;
    shippingGstRate: number;
    beforeRounding: number;
    roundOff: number;
    grandTotal: number;
    amountCharged: number;
  };

  amountInWords: string;
}

/* ------------------------------------------------------------------ *
 * Money helpers — all arithmetic rounded to 2dp to avoid float drift
 * ------------------------------------------------------------------ */

const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

/** GST state codes, used to derive the buyer's code and decide IGST vs CGST+SGST. */
const GST_STATE_CODES: Record<string, string> = {
  "jammu and kashmir": "01", "himachal pradesh": "02", punjab: "03", chandigarh: "04",
  uttarakhand: "05", haryana: "06", delhi: "07", rajasthan: "08", "uttar pradesh": "09",
  bihar: "10", sikkim: "11", "arunachal pradesh": "12", nagaland: "13", manipur: "14",
  mizoram: "15", tripura: "16", meghalaya: "17", assam: "18", "west bengal": "19",
  jharkhand: "20", odisha: "21", orissa: "21", chhattisgarh: "22", "madhya pradesh": "23",
  gujarat: "24", "dadra and nagar haveli and daman and diu": "26", maharashtra: "27",
  karnataka: "29", goa: "30", lakshadweep: "31", kerala: "32", "tamil nadu": "33",
  puducherry: "34", "andaman and nicobar islands": "35", telangana: "36",
  "andhra pradesh": "37", ladakh: "38", "other territory": "97",
};

export function stateCodeFor(stateName: string): string {
  return GST_STATE_CODES[String(stateName ?? "").trim().toLowerCase()] ?? "";
}

/** Convert a rupee amount to Indian-format words (crore / lakh / thousand). */
export function amountInWords(amount: number): string {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
    "Eighteen", "Nineteen",
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const twoDigits = (n: number): string => {
    if (n < 20) return ones[n];
    const t = Math.floor(n / 10);
    const o = n % 10;
    return tens[t] + (o ? ` ${ones[o]}` : "");
  };

  const threeDigits = (n: number): string => {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    return (h ? `${ones[h]} Hundred${rest ? " " : ""}` : "") + (rest ? twoDigits(rest) : "");
  };

  const whole = Math.floor(Math.abs(amount));
  const paise = Math.round((Math.abs(amount) - whole) * 100);

  const buildWhole = (n: number): string => {
    if (n === 0) return "Zero";
    const parts: string[] = [];
    const crore = Math.floor(n / 10000000);
    const lakh = Math.floor((n % 10000000) / 100000);
    const thousand = Math.floor((n % 100000) / 1000);
    const hundred = n % 1000;
    if (crore) parts.push(`${threeDigits(crore)} Crore`);
    if (lakh) parts.push(`${threeDigits(lakh)} Lakh`);
    if (thousand) parts.push(`${threeDigits(thousand)} Thousand`);
    if (hundred) parts.push(threeDigits(hundred));
    return parts.join(" ");
  };

  let words = `${buildWhole(whole)} Rupees`;
  if (paise > 0) words += ` and ${twoDigits(paise)} Paise`;
  return `${words} Only`;
}

/* ------------------------------------------------------------------ *
 * Core computation
 * ------------------------------------------------------------------ */

interface BuyerInput {
  name: string;
  email: string;
  phone: string;
}

/**
 * Turns an order + settings into the fully-computed invoice snapshot.
 *
 * Tax model (standard Indian GST):
 *  - The order-level discount is apportioned across line items in proportion to
 *    their gross value, so each line's taxable value reflects what was actually
 *    paid for it. Rounding remainder is absorbed by the last line so the parts
 *    always sum exactly to the order discount.
 *  - When `pricesIncludeTax` (the default, matching Indian retail pricing), tax
 *    is extracted out of the price: taxable = net x 100/(100+rate).
 *    Otherwise tax is added on top.
 *  - Same-state supply => CGST + SGST at half the rate each.
 *    Different state  => IGST at the full rate.
 */
export function computeInvoiceSnapshot(
  order: any,
  settings: InvoiceSettingsData,
  buyer: BuyerInput,
  meta: { invoiceNumber: string; issuedAt: Date; financialYear: string }
): InvoiceSnapshot {
  const addr = order.shippingAddress ?? {};
  const buyerStateCode = stateCodeFor(addr.state);
  const sellerStateCode = String(settings.seller.stateCode || "").trim();

  // If either side's state code is unknown we cannot prove an inter-state
  // supply, so we fall back to intra-state (CGST+SGST) — the safer default.
  const isInterState =
    settings.tax.gstEnabled &&
    !!buyerStateCode &&
    !!sellerStateCode &&
    buyerStateCode !== sellerStateCode;

  const gstEnabled = settings.tax.gstEnabled;
  const inclusive = settings.tax.pricesIncludeTax;
  const defaultRate = gstEnabled ? Number(settings.tax.defaultGstRate) || 0 : 0;

  const items: any[] = Array.isArray(order.items) ? order.items : [];
  const grossTotal = round2(items.reduce((s, it) => s + it.price * it.quantity, 0));
  const orderDiscount = round2(Number(order.discount) || 0);

  // --- Apportion the discount across lines -------------------------------
  let allocated = 0;
  const lines: InvoiceLine[] = items.map((it, i) => {
    const gross = round2(it.price * it.quantity);
    const isLast = i === items.length - 1;
    const share = isLast
      ? round2(orderDiscount - allocated) // absorb rounding remainder
      : grossTotal > 0
      ? round2((orderDiscount * gross) / grossTotal)
      : 0;
    allocated = round2(allocated + share);

    const net = round2(gross - share);
    const rate = defaultRate;

    let taxable: number;
    let tax: number;
    if (!gstEnabled || rate <= 0) {
      taxable = net;
      tax = 0;
    } else if (inclusive) {
      taxable = round2((net * 100) / (100 + rate));
      tax = round2(net - taxable);
    } else {
      taxable = net;
      tax = round2((net * rate) / 100);
    }

    // CGST and SGST are the same rate on the same taxable value, so they must
    // print as identical amounts — a one-paisa difference between them is a
    // red flag on a tax invoice. Each half is rounded independently; any
    // resulting sub-rupee drift is absorbed by the round-off line below.
    const half = round2(tax / 2);
    const cgst = isInterState ? 0 : half;
    const sgst = isInterState ? 0 : half;
    const igst = isInterState ? tax : 0;

    const variant =
      it.variant && typeof it.variant === "object"
        ? Object.entries(it.variant as Record<string, string>)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ")
        : "";

    return {
      index: i + 1,
      title: String(it.title ?? "Item"),
      variant,
      hsn: settings.tax.defaultHsnCode || "",
      quantity: Number(it.quantity) || 0,
      unitPrice: round2(Number(it.price) || 0),
      gross,
      discount: share,
      taxableValue: taxable,
      gstRate: rate,
      cgst,
      sgst,
      igst,
      lineTotal: round2(taxable + cgst + sgst + igst),
    };
  });

  // --- Shipping treated as its own taxable supply ------------------------
  const shippingFee = round2(Number(order.shippingFee) || 0);
  const shippingRate = gstEnabled ? Number(settings.tax.shippingGstRate) || 0 : 0;
  let shippingTaxable = shippingFee;
  let shippingTax = 0;
  if (shippingFee > 0 && gstEnabled && shippingRate > 0) {
    if (inclusive) {
      shippingTaxable = round2((shippingFee * 100) / (100 + shippingRate));
      shippingTax = round2(shippingFee - shippingTaxable);
    } else {
      shippingTaxable = shippingFee;
      shippingTax = round2((shippingFee * shippingRate) / 100);
    }
  }
  // Same equal-halves rule as the line items above.
  const shippingHalf = round2(shippingTax / 2);
  const shippingCgst = isInterState ? 0 : shippingHalf;
  const shippingSgst = isInterState ? 0 : shippingHalf;
  const shippingIgst = isInterState ? shippingTax : 0;

  // --- Roll up totals ----------------------------------------------------
  const sum = (fn: (l: InvoiceLine) => number) => round2(lines.reduce((s, l) => s + fn(l), 0));

  const taxableValue = round2(sum((l) => l.taxableValue) + shippingTaxable);
  const cgst = round2(sum((l) => l.cgst) + shippingCgst);
  const sgst = round2(sum((l) => l.sgst) + shippingSgst);
  const igst = round2(sum((l) => l.igst) + shippingIgst);
  const totalTax = round2(cgst + sgst + igst);

  const beforeRounding = round2(taxableValue + totalTax);
  const grandTotal = settings.tax.roundOffTotal ? Math.round(beforeRounding) : beforeRounding;
  const roundOff = round2(grandTotal - beforeRounding);

  // --- HSN/SAC-wise summary (grouped by code + rate) ---------------------
  const hsnMap = new Map<string, HsnSummaryRow>();
  const pushHsn = (
    hsn: string,
    rate: number,
    taxableAmt: number,
    c: number,
    s: number,
    ig: number
  ) => {
    if (taxableAmt <= 0 && c + s + ig <= 0) return;
    const key = `${hsn}|${rate}`;
    const existing = hsnMap.get(key);
    if (existing) {
      existing.taxableValue = round2(existing.taxableValue + taxableAmt);
      existing.cgst = round2(existing.cgst + c);
      existing.sgst = round2(existing.sgst + s);
      existing.igst = round2(existing.igst + ig);
      existing.total = round2(existing.taxableValue + existing.cgst + existing.sgst + existing.igst);
    } else {
      hsnMap.set(key, {
        hsn: hsn || "-",
        gstRate: rate,
        taxableValue: round2(taxableAmt),
        cgst: round2(c),
        sgst: round2(s),
        igst: round2(ig),
        total: round2(taxableAmt + c + s + ig),
      });
    }
  };
  for (const l of lines) pushHsn(l.hsn, l.gstRate, l.taxableValue, l.cgst, l.sgst, l.igst);
  if (shippingFee > 0) {
    pushHsn(
      settings.tax.shippingHsnCode || "-",
      shippingRate,
      shippingTaxable,
      shippingCgst,
      shippingSgst,
      shippingIgst
    );
  }

  const addressLines = [addr.line1, addr.line2].filter(Boolean).map(String);

  return {
    invoiceNumber: meta.invoiceNumber,
    issuedAt: meta.issuedAt.toISOString(),
    financialYear: meta.financialYear,

    seller: settings.seller,
    bank: settings.bank,
    document: settings.document,
    taxConfig: { gstEnabled, pricesIncludeTax: inclusive },

    buyer: {
      name: addr.fullName || buyer.name || "",
      email: buyer.email || "",
      phone: addr.phone || buyer.phone || "",
      addressLines,
      city: addr.city || "",
      state: addr.state || "",
      stateCode: buyerStateCode,
      pincode: addr.pincode || "",
    },

    order: {
      id: String(order._id),
      shortId: String(order._id).slice(-8).toUpperCase(),
      placedAt: new Date(order.createdAt ?? Date.now()).toISOString(),
      paymentMethod: order.paymentMethod === "payplus" ? "Prepaid (PayPlus)" : order.paymentMethod === "razorpay" ? "Prepaid (Razorpay)" : "Cash on Delivery",
      paymentStatus: String(order.paymentStatus ?? ""),
      orderStatus: String(order.orderStatus ?? ""),
      couponCode: String(order.couponCode ?? ""),
      razorpayPaymentId: String(order.payplusReference ?? order.razorpayPaymentId ?? ""),
    },

    placeOfSupply: addr.state ? `${addr.state}${buyerStateCode ? ` (${buyerStateCode})` : ""}` : "",
    isInterState,

    lines,
    hsnSummary: Array.from(hsnMap.values()),

    totals: {
      gross: grossTotal,
      discount: orderDiscount,
      taxableValue,
      cgst,
      sgst,
      igst,
      totalTax,
      shippingFee,
      shippingTaxable,
      shippingTax,
      shippingGstRate: shippingRate,
      beforeRounding,
      roundOff,
      grandTotal,
      amountCharged: round2(Number(order.total) || 0),
    },

    amountInWords: amountInWords(grandTotal),
  };
}

/* ------------------------------------------------------------------ *
 * Numbering + persistence
 * ------------------------------------------------------------------ */

/**
 * Atomically reserves the next invoice number.
 *
 * The $inc runs inside a single findOneAndUpdate so two orders confirming at
 * the same moment can never be handed the same sequence. When
 * `resetEachFinancialYear` is on and the FY has rolled over, the counter is
 * reset to 1 for the new year in the same atomic write.
 */
async function allocateInvoiceNumber(
  settings: InvoiceSettingsData,
  issuedAt: Date
): Promise<{ invoiceNumber: string; sequence: number; financialYear: string }> {
  const fy = financialYearOf(issuedAt);
  const { prefix, includeFinancialYear, padding, resetEachFinancialYear } = settings.numbering;

  const isNewYear =
    resetEachFinancialYear && settings.numbering.sequenceFinancialYear !== fy;

  let sequence: number;

  if (isNewYear) {
    // Roll the counter into the new financial year, starting at 1.
    const updated = await InvoiceSettings.findOneAndUpdate(
      { singletonKey: "invoice" },
      { $set: { "numbering.sequenceFinancialYear": fy, "numbering.nextSequence": 2 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean<any>();
    sequence = 1;
    void updated;
  } else {
    const updated = await InvoiceSettings.findOneAndUpdate(
      { singletonKey: "invoice" },
      { $inc: { "numbering.nextSequence": 1 }, $set: { "numbering.sequenceFinancialYear": fy } },
      { new: false, upsert: true, setDefaultsOnInsert: true }
    ).lean<any>();
    sequence = Number(updated?.numbering?.nextSequence ?? settings.numbering.nextSequence) || 1;
  }

  const padded = String(sequence).padStart(Math.max(1, Number(padding) || 1), "0");
  const parts = [prefix || "INV"];
  if (includeFinancialYear) parts.push(fy);
  parts.push(padded);

  return { invoiceNumber: parts.join("/"), sequence, financialYear: fy };
}

/**
 * Returns the invoice for an order, creating and persisting it on first call.
 *
 * Idempotent: if two requests race, the unique index on `order` makes one of
 * them fail with a duplicate-key error, which we swallow and resolve by
 * re-reading the winner's document.
 */
export async function getOrCreateInvoice(orderId: string): Promise<any> {
  await connectDB();

  const existing = await Invoice.findOne({ order: orderId }).lean();
  if (existing) return existing;

  const order = await Order.findById(orderId).lean<any>();
  if (!order) return null;

  const settings = await getInvoiceSettings();
  const issuedAt = new Date();

  // Guest orders have no User row. Falling through to empty strings would put
  // a blank buyer on a tax invoice, so guest contact and the shipping address
  // are used instead — the address is always present and always has a name.
  const customer = order.user
    ? await User.findById(order.user).select("name email phone").lean<any>()
    : null;

  const buyer = {
    name: customer?.name ?? order.guest?.name ?? order.shippingAddress?.fullName ?? "",
    email: customer?.email ?? order.guest?.email ?? "",
    phone: customer?.phone ?? order.guest?.phone ?? order.shippingAddress?.phone ?? "",
  };

  const { invoiceNumber, sequence, financialYear } = await allocateInvoiceNumber(settings, issuedAt);

  const snapshot = computeInvoiceSnapshot(order, settings, buyer, {
    invoiceNumber,
    issuedAt,
    financialYear,
  });

  try {
    const created = await Invoice.create({
      order: order._id,
      user: order.user,
      invoiceNumber,
      financialYear,
      sequence,
      issuedAt,
      grandTotal: snapshot.totals.grandTotal,
      totalTax: snapshot.totals.totalTax,
      buyerName: snapshot.buyer.name,
      placeOfSupply: snapshot.placeOfSupply,
      isInterState: snapshot.isInterState,
      snapshot,
    });
    return created.toObject();
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && (err as { code?: number }).code === 11000) {
      // Lost a race — the other request already issued this order's invoice.
      return await Invoice.findOne({ order: orderId }).lean();
    }
    throw err;
  }
}
