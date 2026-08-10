import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Address, User } from "@/models";
import { addressSchema } from "@/lib/validations/address";
import { requireAuth } from "@/lib/middleware/requireAuth";

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const addresses = await Address.find({ user: user.id }).sort({ isDefault: -1, createdAt: -1 }).lean();
    return NextResponse.json({ addresses });
  } catch (err) {
    console.error("List addresses error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = addressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();

    // If this is set as default, or it's the user's first address, unset any
    // existing default so there's always at most one.
    const existingCount = await Address.countDocuments({ user: user.id });
    const isDefault = parsed.data.isDefault || existingCount === 0;

    if (isDefault) {
      await Address.updateMany({ user: user.id }, { isDefault: false });
    }

    const address = await Address.create({ ...parsed.data, isDefault, user: user.id });

    await User.findByIdAndUpdate(user.id, { $push: { addresses: address._id } });

    return NextResponse.json({ address }, { status: 201 });
  } catch (err) {
    console.error("Create address error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
