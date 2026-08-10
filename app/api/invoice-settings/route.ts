import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import InvoiceSettings from "@/models/InvoiceSettings";
import { invoiceSettingsSchema } from "@/lib/validations/invoiceSettings";
import { requireAdmin } from "@/lib/middleware/requireAdmin";
import { logAdminAction, getClientIp } from "@/lib/middleware/logAdminAction";
import { getInvoiceSettings } from "@/lib/invoice/settings";

export const dynamic = "force-dynamic";

/**
 * GET /api/invoice-settings  (admin) — the current invoice configuration.
 * Admin-only: unlike storefront settings, this holds legal and financial
 * identity (GSTIN, PAN, bank details) that must not be publicly readable.
 */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const settings = await getInvoiceSettings();
    return NextResponse.json({ settings });
  } catch (err) {
    console.error("Get invoice settings error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

/** PUT /api/invoice-settings  (admin) — replace the editable configuration. */
export async function PUT(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = invoiceSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();

    const before = await InvoiceSettings.findOne({ singletonKey: "invoice" }).lean<any>();

    // Guard the numbering counter: it may be raised (to align with a previous
    // system) but never lowered, since reusing an invoice number would create
    // duplicate legal documents.
    const requestedNext = parsed.data.numbering.nextSequence;
    const currentNext = Number(before?.numbering?.nextSequence ?? 1);
    const safeNext = Math.max(requestedNext, currentNext);

    const update = {
      ...parsed.data,
      numbering: { ...parsed.data.numbering, nextSequence: safeNext },
    };

    await InvoiceSettings.findOneAndUpdate(
      { singletonKey: "invoice" },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await logAdminAction({
      adminId: admin.id,
      action: "SETTINGS_UPDATE",
      targetType: "Settings",
      changes: {
        scope: "invoice",
        before: summarize(before),
        after: summarize(update),
      },
      ipAddress: getClientIp(req),
    });

    const settings = await getInvoiceSettings();
    return NextResponse.json({
      settings,
      // Surface the clamp so the UI can explain why the value didn't drop.
      sequenceAdjusted: safeNext !== requestedNext ? safeNext : undefined,
    });
  } catch (err) {
    console.error("Update invoice settings error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

/** Keep the audit diff compact — the full settings blob would be unreadable. */
function summarize(obj: any) {
  return {
    legalName: obj?.seller?.legalName,
    gstin: obj?.seller?.gstin,
    stateCode: obj?.seller?.stateCode,
    gstEnabled: obj?.tax?.gstEnabled,
    defaultGstRate: obj?.tax?.defaultGstRate,
    pricesIncludeTax: obj?.tax?.pricesIncludeTax,
    prefix: obj?.numbering?.prefix,
    nextSequence: obj?.numbering?.nextSequence,
    attachToOrderEmail: obj?.attachToOrderEmail,
  };
}
