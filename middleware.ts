import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { verifyAccessToken, ACCESS_TOKEN_COOKIE } from "@/lib/auth";

const ADMIN_PREFIX = "/admin";
const ACCOUNT_PREFIX = "/account";
const GUEST_ONLY_ROUTES = ["/login", "/register"];

async function resolveRole(req: NextRequest): Promise<string | undefined> {
  // 1. Check NextAuth (Google OAuth) session — getToken is edge-compatible.
  const nextAuthToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  let role = nextAuthToken?.role as string | undefined;

  // 2. Fall back to the custom JWT cookie (email/password users).
  if (!role) {
    const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
    if (accessToken) {
      const payload = await verifyAccessToken(accessToken);
      role = payload?.role;
    }
  }
  return role;
}

/**
 * Runs on the Edge before the matched routes render. This is the FIRST layer
 * of protection (redirects unauthenticated users away from pages). Every
 * admin API route also re-checks with requireAdmin() as a second layer,
 * since middleware only guards page navigation, not direct API calls.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith(ADMIN_PREFIX);
  const isAccountRoute = pathname.startsWith(ACCOUNT_PREFIX);
  const isGuestOnlyRoute = GUEST_ONLY_ROUTES.includes(pathname);

  // /checkout is deliberately NOT gated any more. Guests buy without an
  // account; identity is established at checkout by phone + OTP instead, and
  // the order routes enforce that server-side. Gating the page here would send
  // every buyer to a login form — the exact friction guest checkout removes.
  if (!isAdminRoute && !isAccountRoute && !isGuestOnlyRoute) {
    return NextResponse.next();
  }

  const role = await resolveRole(req);

  // Already logged in (customer or admin) and trying to visit /login or
  // /register — send them home instead of showing the form again.
  if (isGuestOnlyRoute) {
    if (role) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (!role) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/login",
    "/register",
  ],
};
