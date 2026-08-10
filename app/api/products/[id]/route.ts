import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models";
import { productSchema } from "@/lib/validations/product";
import { requireAdmin } from "@/lib/middleware/requireAdmin";
import { logAdminAction, getClientIp } from "@/lib/middleware/logAdminAction";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const product = await Product.findById(params.id).populate("category", "name slug").lean();
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (err) {
    console.error("Get product error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = productSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();

    const existing = await Product.findById(params.id);
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Slug is intentionally immutable after creation — editing the title
    // should never silently break an existing product URL.
    const product = await Product.findByIdAndUpdate(params.id, parsed.data, { new: true });

    await logAdminAction({
      adminId: admin.id,
      action: "PRODUCT_UPDATE",
      targetType: "Product",
      targetId: params.id,
      changes: { updatedFields: Object.keys(parsed.data) },
      ipAddress: getClientIp(req),
    });

    const productObj = product?.toObject({ flattenMaps: true });

    return NextResponse.json({ product: productObj });
  } catch (err) {
    console.error("Update product error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await connectDB();

    const product = await Product.findByIdAndDelete(params.id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await logAdminAction({
      adminId: admin.id,
      action: "PRODUCT_DELETE",
      targetType: "Product",
      targetId: params.id,
      changes: { deleted: { title: product.title, slug: product.slug } },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete product error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
