import { z } from "zod";

/**
 * Validates the invoice-settings payload from the admin CMS. Every field has a
 * default so a partial payload still parses, keeping the API tolerant as the
 * form evolves.
 */
export const invoiceSettingsSchema = z.object({
  seller: z
    .object({
      legalName: z.string().trim().default(""),
      tradeName: z.string().trim().default(""),
      addressLine1: z.string().default(""),
      addressLine2: z.string().default(""),
      city: z.string().default(""),
      state: z.string().default(""),
      stateCode: z
        .string()
        .trim()
        .regex(/^\d{0,2}$/, "State code must be the 2-digit GST code (e.g. 06)")
        .default(""),
      pincode: z.string().default(""),
      country: z.string().default("India"),
      gstin: z
        .string()
        .trim()
        .toUpperCase()
        .refine((v) => v === "" || /^[0-9A-Z]{15}$/.test(v), "GSTIN must be 15 characters")
        .default(""),
      pan: z
        .string()
        .trim()
        .toUpperCase()
        .refine((v) => v === "" || /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v), "PAN format looks invalid")
        .default(""),
      cin: z.string().trim().default(""),
      email: z.string().default(""),
      phone: z.string().default(""),
      website: z.string().default(""),
      logoUrl: z.string().default(""),
    })
    .default({}),

  tax: z
    .object({
      gstEnabled: z.boolean().default(true),
      defaultGstRate: z.coerce.number().min(0).max(100).default(18),
      defaultHsnCode: z.string().trim().default(""),
      pricesIncludeTax: z.boolean().default(true),
      shippingHsnCode: z.string().trim().default("996812"),
      shippingGstRate: z.coerce.number().min(0).max(100).default(18),
      roundOffTotal: z.boolean().default(true),
    })
    .default({}),

  numbering: z
    .object({
      prefix: z.string().trim().max(12, "Prefix is too long").default("INV"),
      includeFinancialYear: z.boolean().default(true),
      padding: z.coerce.number().int().min(1).max(10).default(5),
      // nextSequence is intentionally editable so an admin can align numbering
      // with a previous system, but it is never decreased silently by the API.
      nextSequence: z.coerce.number().int().min(1).default(1),
      resetEachFinancialYear: z.boolean().default(true),
    })
    .default({}),

  document: z
    .object({
      title: z.string().trim().default("TAX INVOICE"),
      declaration: z.string().default(""),
      terms: z.string().default(""),
      notes: z.string().default(""),
      footerText: z.string().default(""),
      signatureLabel: z.string().default("Authorised Signatory"),
      showBankDetails: z.boolean().default(false),
      showHsnSummary: z.boolean().default(true),
      showAmountInWords: z.boolean().default(true),
    })
    .default({}),

  bank: z
    .object({
      accountName: z.string().default(""),
      accountNumber: z.string().default(""),
      bankName: z.string().default(""),
      ifsc: z.string().trim().toUpperCase().default(""),
      branch: z.string().default(""),
    })
    .default({}),

  attachToOrderEmail: z.boolean().default(true),
});

export type InvoiceSettingsInput = z.infer<typeof invoiceSettingsSchema>;
