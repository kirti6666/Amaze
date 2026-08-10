import { Schema, models, model } from "mongoose";

/**
 * InvoiceSettings — a SINGLETON document holding everything the admin can
 * configure about invoices: legal seller identity, GST/tax behaviour, invoice
 * numbering, and the boilerplate text printed on the document.
 *
 * Kept separate from SiteSettings deliberately: these are legal/finance fields
 * with their own audit sensitivity, and separating them means the storefront
 * CMS and the invoice CMS can evolve independently.
 *
 * `nextSequence` is the numbering counter. It is incremented atomically
 * ($inc + findOneAndUpdate) when an invoice is issued, so two concurrent
 * orders can never receive the same invoice number.
 */

const BankSchema = new Schema(
  {
    accountName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    bankName: { type: String, default: "" },
    ifsc: { type: String, default: "" },
    branch: { type: String, default: "" },
  },
  { _id: false }
);

const SellerSchema = new Schema(
  {
    legalName: { type: String, default: "" },
    tradeName: { type: String, default: "" },
    addressLine1: { type: String, default: "" },
    addressLine2: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    /** Two-digit GST state code, e.g. "06" for Haryana. */
    stateCode: { type: String, default: "" },
    pincode: { type: String, default: "" },
    country: { type: String, default: "India" },
    gstin: { type: String, default: "" },
    pan: { type: String, default: "" },
    cin: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    website: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
  },
  { _id: false }
);

const TaxSchema = new Schema(
  {
    /** Master switch — when false the invoice prints with no tax columns. */
    gstEnabled: { type: Boolean, default: true },
    /** Applied to every line unless a per-item override exists. */
    defaultGstRate: { type: Number, default: 18 },
    /** Default HSN/SAC code printed against products. */
    defaultHsnCode: { type: String, default: "" },
    /**
     * True (Indian retail norm): catalogue prices already include GST, so tax
     * is back-calculated out of the price. False: tax is added on top.
     */
    pricesIncludeTax: { type: Boolean, default: true },
    /** Shipping is a taxable supply; usually the same rate as the goods. */
    shippingHsnCode: { type: String, default: "996812" },
    shippingGstRate: { type: Number, default: 18 },
    /** Round the grand total to the nearest rupee and show a round-off line. */
    roundOffTotal: { type: Boolean, default: true },
  },
  { _id: false }
);

const NumberingSchema = new Schema(
  {
    prefix: { type: String, default: "INV" },
    /** Insert the Indian financial year (e.g. 2026-27) into the number. */
    includeFinancialYear: { type: Boolean, default: true },
    padding: { type: Number, default: 5 },
    nextSequence: { type: Number, default: 1 },
    /** FY that `nextSequence` belongs to; the counter resets when it rolls. */
    sequenceFinancialYear: { type: String, default: "" },
    /** Restart numbering from 1 each financial year (standard practice). */
    resetEachFinancialYear: { type: Boolean, default: true },
  },
  { _id: false }
);

const DocumentSchema = new Schema(
  {
    title: { type: String, default: "TAX INVOICE" },
    /** Printed under the totals; the standard GST self-declaration. */
    declaration: {
      type: String,
      default:
        "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
    },
    terms: { type: String, default: "" },
    notes: { type: String, default: "" },
    footerText: { type: String, default: "This is a computer-generated invoice and does not require a physical signature." },
    signatureLabel: { type: String, default: "Authorised Signatory" },
    showBankDetails: { type: Boolean, default: false },
    showHsnSummary: { type: Boolean, default: true },
    showAmountInWords: { type: Boolean, default: true },
  },
  { _id: false }
);

const InvoiceSettingsSchema = new Schema(
  {
    singletonKey: { type: String, default: "invoice", unique: true, index: true },
    seller: { type: SellerSchema, default: () => ({}) },
    tax: { type: TaxSchema, default: () => ({}) },
    numbering: { type: NumberingSchema, default: () => ({}) },
    document: { type: DocumentSchema, default: () => ({}) },
    /** Attach the invoice PDF to the order-confirmation email. */
    attachToOrderEmail: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.InvoiceSettings || model("InvoiceSettings", InvoiceSettingsSchema);
