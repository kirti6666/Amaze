import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";
import { requireAdmin } from "@/lib/middleware/requireAdmin";

export const dynamic = "force-dynamic";

/**
 * GET /api/invoices  (admin) — the invoice register: every issued invoice with
 * running totals, for reconciliation and GST filing.
 *
 * Supports ?search= (invoice number or buyer name), ?from=/?to= (issue date),
 * and pagination. The `totals` block aggregates across the WHOLE filtered set,
 * not just the current page, so the figures are usable for a return.
 */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Number(searchParams.get("limit") ?? 25));
    const search = (searchParams.get("search") ?? "").trim();
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const filter: Record<string, unknown> = {};

    if (search) {
      // Escape regex metacharacters so a stray "(" can't break the query.
      const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { invoiceNumber: { $regex: safe, $options: "i" } },
        { buyerName: { $regex: safe, $options: "i" } },
      ];
    }

    if (from || to) {
      const range: Record<string, Date> = {};
      if (from) range.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        range.$lte = end;
      }
      filter.issuedAt = range;
    }

    const [invoices, total, agg] = await Promise.all([
      Invoice.find(filter)
        .select("invoiceNumber issuedAt buyerName grandTotal totalTax placeOfSupply isInterState order")
        .sort({ issuedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Invoice.countDocuments(filter),
      Invoice.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            grandTotal: { $sum: "$grandTotal" },
            totalTax: { $sum: "$totalTax" },
          },
        },
      ]),
    ]);

    return NextResponse.json({
      invoices,
      totals: {
        grandTotal: agg[0]?.grandTotal ?? 0,
        totalTax: agg[0]?.totalTax ?? 0,
        count: total,
      },
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("List invoices error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
