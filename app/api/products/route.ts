import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models";
import { productSchema } from "@/lib/validations/product";
import { requireAdmin } from "@/lib/middleware/requireAdmin";
import { logAdminAction, getClientIp } from "@/lib/middleware/logAdminAction";
import { slugify } from "@/lib/slugify";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Number(searchParams.get("limit") ?? 20));
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    // "all=true" includes inactive products — the admin product list uses this;
    // the public storefront never passes it, so shoppers only ever see active products.
    const includeInactive = searchParams.get("all") === "true";

    const filter: Record<string, unknown> = {};
    if (!includeInactive) filter.isActive = true;
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("List products error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();

    const baseSlug = slugify(parsed.data.title);
    let slug = baseSlug;
    let suffix = 2;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const product = await Product.create({ ...parsed.data, slug });

    await logAdminAction({
      adminId: admin.id,
      action: "PRODUCT_CREATE",
      targetType: "Product",
      targetId: product._id.toString(),
      changes: { after: { title: product.title, price: product.price, slug: product.slug } },
      ipAddress: getClientIp(req),
    });

    // flattenMaps: true is required here — without it, the variantCombinations[].combination
    // Map fields would serialize to "{}" in the JSON response (native Map has no JSON.stringify
    // support). .lean() queries elsewhere don't need this since lean() returns plain objects already.
    const productObj = product.toObject({ flattenMaps: true });

    return NextResponse.json({ product: productObj }, { status: 201 });
  } catch (err) {
    console.error("Create product error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
