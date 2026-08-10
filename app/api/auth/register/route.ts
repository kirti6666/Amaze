import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { registerSchema } from "@/lib/validations/auth";
import {
  signAccessToken,
  signRefreshToken,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Public registration is ALWAYS a customer account. Admin accounts are
    // seeded/created manually — there is intentionally no public path to admin.
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      provider: "credentials",
      role: "customer",
    });

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role as "customer",
    };
    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    const res = NextResponse.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
    res.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, accessCookieOptions);
    res.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, refreshCookieOptions);

    return res;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
