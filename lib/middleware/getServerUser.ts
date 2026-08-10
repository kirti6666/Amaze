import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth-options";
import { verifyAccessToken, ACCESS_TOKEN_COOKIE } from "@/lib/auth";
import type { CurrentUser } from "./requireAuth";

/**
 * Same resolution logic as requireAuth(), but for Server Components/layouts,
 * where there's no NextRequest to read cookies from — uses next/headers instead.
 * Kept as a separate small function rather than a shared generic, since the
 * cookie-reading APIs differ between Route Handlers and Server Components.
 */
export async function getServerUser(): Promise<CurrentUser | null> {
  const session = await getServerSession(authOptions);
  if (session?.user?.id && session.user.role) {
    return { id: session.user.id, email: session.user.email ?? "", role: session.user.role };
  }

  const cookieStore = cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (token) {
    const payload = await verifyAccessToken(token);
    if (payload) {
      return { id: payload.userId, email: payload.email, role: payload.role };
    }
  }

  return null;
}
