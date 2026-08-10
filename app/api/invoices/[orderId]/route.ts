import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { verifyGuestToken, GUEST_TOKEN_COOKIE } from "@/lib/guestSession";
import { guestOwnsOrder } from "@/lib/checkoutIdentity";
import { getOrCreateInvoice } from "@/lib/invoice/compute";
import { renderInvoicePdf } from "@/lib/invoice/render";

export const dynamic = "force-dynamic";

/**
 * GET /api/invoices/[orderId]  — the tax invoice PDF for an order.
 *
 * Access: the customer who placed the order, or any admin. The invoice is
 * issued (numbered + persisted) on first request and re-rendered from the
 * stored snapshot thereafter, so the document never changes once issued.
 *
 * `?download=1` forces a save dialog; otherwise it renders inline in the
 * browser's built-in PDF viewer.
 */
export async function GET(req: NextRequest, { params }: { params: { orderId: string } }) {
  // Account session OR verified guest token — a guest who paid still needs
  // their tax invoice, and has no account to log into.
  const user = await requireAuth(req);
  const guestToken = req.cookies.get(GUEST_TOKEN_COOKIE)?.value;
  const guest = !user && guestToken ? await verifyGuestToken(guestToken) : null;

  if (!user && !guest) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const order = await Order.findById(params.orderId).select("user guest").lean<any>();
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const isOwner = user
      ? String(order.user) === user.id
      : guestOwnsOrder(order.guest, guest ?? {});

    if (!isOwner && user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const invoice = await getOrCreateInvoice(params.orderId);
    if (!invoice?.snapshot) {
      return NextResponse.json({ error: "Could not generate invoice" }, { status: 500 });
    }

    const pdf = renderInvoicePdf(invoice.snapshot);
    const safeName = String(invoice.invoiceNumber).replace(/[^\w.-]+/g, "-");
    const disposition =
      new URL(req.url).searchParams.get("download") === "1" ? "attachment" : "inline";

    return new NextResponse(pdf as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="${safeName}.pdf"`,
        "Content-Length": String(pdf.length),
        // Invoices are immutable once issued, but they're per-user documents —
        // keep them out of any shared/CDN cache.
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  } catch (err) {
    console.error("Invoice PDF error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
