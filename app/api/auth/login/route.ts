import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { loginSchema } from "@/lib/validations/auth";
import {
  signAccessToken,
  signRefreshToken,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
} from "@/lib/auth";
import { logAdminAction, getClientIp } from "@/lib/middleware/logAdminAction";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    await connectDB();

    // password has `select: false` in the schema, so it must be explicitly requested
    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.password) {
      // Same generic message whether the email doesn't exist or the password is wrong —
      // avoids leaking which emails are registered.
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role as "customer" | "admin",
    };
    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    const res = NextResponse.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
    res.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, accessCookieOptions);
    res.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, refreshCookieOptions);

    if (user.role === "admin") {
      await logAdminAction({
        adminId: user._id.toString(),
        action: "LOGIN",
        ipAddress: getClientIp(req),
      });
    }

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
