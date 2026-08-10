import mongoose, { Schema, models, model } from "mongoose";

/**
 * Invoice — the permanent record of an issued tax invoice.
 *
 * Design decision: this stores a full SNAPSHOT of everything printed (seller
 * identity, buyer details, line items, tax breakup, totals) rather than
 * recomputing from the order and current settings each time.
 *
 * That is deliberate and matters legally: an invoice is a fixed financial
 * document. If the admin later changes the GST rate, the company address, or a
 * product's price, previously issued invoices must still render exactly as they
 * were issued. Re-deriving them would silently rewrite history.
 *
 * One invoice per order, enforced by a unique index on `order`.
 */

const InvoiceSchema = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
      index: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },

    /** Human-readable invoice number, e.g. INV/2026-27/00042. */
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    financialYear: { type: String, default: "" },
    sequence: { type: Number, default: 0 },
    issuedAt: { type: Date, default: Date.now },

    /** Denormalized for fast admin listing/filtering without loading the snapshot. */
    grandTotal: { type: Number, default: 0 },
    totalTax: { type: Number, default: 0 },
    buyerName: { type: String, default: "" },
    placeOfSupply: { type: String, default: "" },
    isInterState: { type: Boolean, default: false },

    /**
     * The frozen document contents. Typed loosely on purpose — it is a rendered
     * artifact, not a queryable entity. See lib/invoice/compute.ts for its shape
     * (InvoiceSnapshot).
     */
    snapshot: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

InvoiceSchema.index({ createdAt: -1 });

export default models.Invoice || model("Invoice", InvoiceSchema);
