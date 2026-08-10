import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Category } from "@/models";
import { categorySchema } from "@/lib/validations/category";
import { requireAdmin } from "@/lib/middleware/requireAdmin";
import { logAdminAction, getClientIp } from "@/lib/middleware/logAdminAction";
import { slugify } from "@/lib/slugify";

// Public — returns every category (including inactive ones). The list is
// small (10-20 categories) so there's no sensitive-data concern; the
// storefront filters by isActive itself when displaying to shoppers.
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ name: 1 }).lean();
    return NextResponse.json({ categories });
  } catch (err) {
    console.error("List categories error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();

    // Ensure slug uniqueness even if two categories share a name (e.g. "Bags" twice)
    const baseSlug = slugify(parsed.data.name);
    let slug = baseSlug;
    let suffix = 2;
    while (await Category.findOne({ slug })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const category = await Category.create({ ...parsed.data, slug });

    await logAdminAction({
      adminId: admin.id,
      action: "CATEGORY_CREATE",
      targetType: "Category",
      targetId: category._id.toString(),
      changes: { after: { name: category.name, slug: category.slug } },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (err) {
    console.error("Create category error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
