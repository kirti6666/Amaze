import { connectDB } from "@/lib/db";
import { AuditLog } from "@/models";
import type { AuditAction } from "@/models/AuditLog";

interface LogAdminActionParams {
  adminId: string;
  action: AuditAction;
  targetType?: "Product" | "Order" | "Category" | "Coupon" | "Review" | "User" | "Settings";
  targetId?: string;
  changes?: Record<string, unknown>; // e.g. { before: {...}, after: {...} }
  ipAddress?: string;
}

/**
 * Writes one immutable audit trail entry. Call this from:
 *  - the login route, on every successful admin login
 *  - every admin write route in later phases (product/category/order/coupon create-update-delete)
 *
 * By design there is no update/delete route for AuditLog anywhere in the app —
 * it must stay a trustworthy, tamper-evident record.
 *
 * A logging failure should never block the admin action itself, so errors are
 * swallowed here (and reported to console) rather than thrown.
 */
export async function logAdminAction(params: LogAdminActionParams): Promise<void> {
  try {
    await connectDB();
    await AuditLog.create({
      admin: params.adminId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      changes: params.changes,
      ipAddress: params.ipAddress,
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

/** Best-effort helper to pull a client IP from standard proxy headers (Vercel included). */
export function getClientIp(req: Request): string | undefined {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? undefined;
}
