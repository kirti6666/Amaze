import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Category, Product } from "@/models";
import { categorySchema } from "@/lib/validations/category";
import { requireAdmin } from "@/lib/middleware/requireAdmin";
import { logAdminAction, getClientIp } from "@/lib/middleware/logAdminAction";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const category = await Category.findById(params.id).lean();
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ category });
  } catch (err) {
    console.error("Get category error:", err);
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
    const parsed = categorySchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();

    const before = await Category.findById(params.id).lean();
    if (!before) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const category = await Category.findByIdAndUpdate(params.id, parsed.data, { new: true });

    await logAdminAction({
      adminId: admin.id,
      action: "CATEGORY_UPDATE",
      targetType: "Category",
      targetId: params.id,
      changes: { updatedFields: parsed.data },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ category });
  } catch (err) {
    console.error("Update category error:", err);
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

    // Prevent orphaned products — block deletion while products still reference this category.
    const productCount = await Product.countDocuments({ category: params.id });
    if (productCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete: ${productCount} product(s) still use this category. Reassign or delete them first.`,
        },
        { status: 409 }
      );
    }

    const category = await Category.findByIdAndDelete(params.id);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await logAdminAction({
      adminId: admin.id,
      action: "CATEGORY_DELETE",
      targetType: "Category",
      targetId: params.id,
      changes: { deleted: { name: category.name, slug: category.slug } },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete category error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
