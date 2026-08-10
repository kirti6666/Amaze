import { NextRequest, NextResponse } from "next/server";
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token provided" }, { status: 401 });
  }

  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 });
  }

  const { userId, email, role } = payload;

  // Rotate both tokens on refresh (not just the access token) — limits how long
  // a stolen refresh token stays useful.
  const newAccessToken = await signAccessToken({ userId, email, role });
  const newRefreshToken = await signRefreshToken({ userId, email, role });

  const res = NextResponse.json({ success: true });
  res.cookies.set(ACCESS_TOKEN_COOKIE, newAccessToken, accessCookieOptions);
  res.cookies.set(REFRESH_TOKEN_COOKIE, newRefreshToken, refreshCookieOptions);

  return res;
}
