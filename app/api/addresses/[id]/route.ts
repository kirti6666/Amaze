import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Address, User } from "@/models";
import { addressSchema } from "@/lib/validations/address";
import { requireAuth } from "@/lib/middleware/requireAuth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = addressSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();

    const existing = await Address.findById(params.id);
    if (!existing || existing.user.toString() !== user.id) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    if (parsed.data.isDefault) {
      await Address.updateMany({ user: user.id }, { isDefault: false });
    }

    const address = await Address.findByIdAndUpdate(params.id, parsed.data, { new: true });

    return NextResponse.json({ address });
  } catch (err) {
    console.error("Update address error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();

    const existing = await Address.findById(params.id);
    if (!existing || existing.user.toString() !== user.id) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    await Address.findByIdAndDelete(params.id);
    await User.findByIdAndUpdate(user.id, { $pull: { addresses: params.id } });

    // If the deleted address was the default, promote the most recent remaining one.
    if (existing.isDefault) {
      const next = await Address.findOne({ user: user.id }).sort({ createdAt: -1 });
      if (next) {
        next.isDefault = true;
        await next.save();
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete address error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
