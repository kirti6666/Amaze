import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AuditLog } from "@/models";
import { requireAdmin } from "@/lib/middleware/requireAdmin";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Number(searchParams.get("limit") ?? 30));
    const action = searchParams.get("action");

    const filter: Record<string, unknown> = {};
    if (action) filter.action = action;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate("admin", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return NextResponse.json({
      logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("List audit logs error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
