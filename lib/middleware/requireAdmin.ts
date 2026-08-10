import { NextRequest } from "next/server";
import { getCurrentUser, CurrentUser } from "./requireAuth";

/**
 * Use at the top of any admin-only route handler:
 *   const admin = await requireAdmin(req);
 *   if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
 *
 * This is the SECOND layer of admin protection — middleware.ts already blocks
 * page navigation to /admin/**, but every admin API route re-checks here too,
 * since API routes can be called directly regardless of which page you're on.
 */
export async function requireAdmin(req: NextRequest): Promise<CurrentUser | null> {
  const user = await getCurrentUser(req);
  if (!user || user.role !== "admin") return null;
  return user;
}
