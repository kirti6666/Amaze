import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ success: true });

  // Clear the custom JWT cookies. Note: if the user signed in via Google,
  // the client should also call next-auth/react's signOut() to clear the
  // NextAuth session cookie — the two auth paths are independent.
  res.cookies.set(ACCESS_TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set(REFRESH_TOKEN_COOKIE, "", { path: "/", maxAge: 0 });

  return res;
}
