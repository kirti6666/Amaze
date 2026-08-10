import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth-options";
import { verifyAccessToken, ACCESS_TOKEN_COOKIE } from "@/lib/auth";

export interface CurrentUser {
  id: string;
  email: string;
  role: "customer" | "admin";
}

/**
 * Resolves the current user from EITHER path:
 *  - a NextAuth session (Google OAuth users)
 *  - a custom JWT access token cookie (email/password users)
 *
 * Returns null if neither is present/valid. Callers decide how to respond
 * (this never throws, so route handlers stay in control of status codes).
 *
 * Use this inside app/api/** Route Handlers, where a NextRequest is available.
 * For Server Components/layouts, use getServerUser() instead (see getServerUser.ts).
 */
export async function getCurrentUser(req: NextRequest): Promise<CurrentUser | null> {
  const session = await getServerSession(authOptions);
  if (session?.user?.id && session.user.role) {
    return { id: session.user.id, email: session.user.email ?? "", role: session.user.role };
  }

  const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (token) {
    const payload = await verifyAccessToken(token);
    if (payload) {
      return { id: payload.userId, email: payload.email, role: payload.role };
    }
  }

  return null;
}

/**
 * Use at the top of any protected route handler:
 *   const user = await requireAuth(req);
 *   if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 */
export async function requireAuth(req: NextRequest): Promise<CurrentUser | null> {
  return getCurrentUser(req);
}
