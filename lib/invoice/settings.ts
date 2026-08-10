import { connectDB } from "@/lib/db";
import { mergeSettings } from "@/lib/site-settings";
import InvoiceSettings from "@/models/InvoiceSettings";

export interface InvoiceSettingsData {
  seller: {
    legalName: string;
    tradeName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    stateCode: string;
    pincode: string;
    country: string;
    gstin: string;
    pan: string;
    cin: string;
    email: string;
    phone: string;
    website: string;
    logoUrl: string;
  };
  tax: {
    gstEnabled: boolean;
    defaultGstRate: number;
    defaultHsnCode: string;
    pricesIncludeTax: boolean;
    shippingHsnCode: string;
    shippingGstRate: number;
    roundOffTotal: boolean;
  };
  numbering: {
    prefix: string;
    includeFinancialYear: boolean;
    padding: number;
    nextSequence: number;
    sequenceFinancialYear: string;
    resetEachFinancialYear: boolean;
  };
  document: {
    title: string;
    declaration: string;
    terms: string;
    notes: string;
    footerText: string;
    signatureLabel: string;
    showBankDetails: boolean;
    showHsnSummary: boolean;
    showAmountInWords: boolean;
  };
  bank: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    ifsc: string;
    branch: string;
  };
  attachToOrderEmail: boolean;
}

export const DEFAULT_INVOICE_SETTINGS: InvoiceSettingsData = {
  seller: {
    legalName: "",
    tradeName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    stateCode: "",
    pincode: "",
    country: "India",
    gstin: "",
    pan: "",
    cin: "",
    email: "",
    phone: "",
    website: "",
    logoUrl: "",
  },
  tax: {
    gstEnabled: true,
    defaultGstRate: 18,
    defaultHsnCode: "",
    pricesIncludeTax: true,
    shippingHsnCode: "996812",
    shippingGstRate: 18,
    roundOffTotal: true,
  },
  numbering: {
    prefix: "INV",
    includeFinancialYear: true,
    padding: 5,
    nextSequence: 1,
    sequenceFinancialYear: "",
    resetEachFinancialYear: true,
  },
  document: {
    title: "TAX INVOICE",
    declaration:
      "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
    terms: "",
    notes: "",
    footerText:
      "This is a computer-generated invoice and does not require a physical signature.",
    signatureLabel: "Authorised Signatory",
    showBankDetails: false,
    showHsnSummary: true,
    showAmountInWords: true,
  },
  bank: {
    accountName: "",
    accountNumber: "",
    bankName: "",
    ifsc: "",
    branch: "",
  },
  attachToOrderEmail: true,
};

/**
 * Reads the singleton invoice settings, creating it with defaults on first use,
 * and always returns a fully-populated object (stored values merged over the
 * defaults). Falls back to defaults if the DB is unreachable so invoice
 * rendering can never hard-fail a page or an order email.
 */
export async function getInvoiceSettings(): Promise<InvoiceSettingsData> {
  try {
    await connectDB();
    let doc = await InvoiceSettings.findOne({ singletonKey: "invoice" }).lean();
    if (!doc) {
      const created = await InvoiceSettings.create({
        singletonKey: "invoice",
        ...DEFAULT_INVOICE_SETTINGS,
      });
      doc = created.toObject();
    }
    return mergeSettings(DEFAULT_INVOICE_SETTINGS, doc as unknown);
  } catch (err) {
    console.error("getInvoiceSettings failed, using defaults:", err);
    return DEFAULT_INVOICE_SETTINGS;
  }
}

/**
 * Indian financial year for a date: 1 April → 31 March.
 * e.g. 2026-07-21 → "2026-27", 2026-02-10 → "2025-26".
 */
export function financialYearOf(date: Date): string {
  const year = date.getFullYear();
  const startYear = date.getMonth() >= 3 ? year : year - 1; // month 3 = April
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
}
