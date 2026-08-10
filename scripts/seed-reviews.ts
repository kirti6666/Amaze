/**
 * Sample review seeder — demo/staging data.
 *
 *   npm run seed:reviews            → create sample reviewers + reviews
 *   npm run seed:reviews -- --purge → delete every sample reviewer + review
 *
 * Read the warning at the top of scripts/sample-reviews.ts before running this
 * against anything customer-facing: these reviews are invented, and publishing
 * invented reviews is an unfair trade practice under the Consumer Protection
 * Act 2019. Purge before launch.
 *
 * Safety properties, so this can never quietly become production data:
 *  - every account it creates uses the @sample.invalid domain (a reserved TLD
 *    that can't receive mail and can't collide with a real customer);
 *  - accounts are created with no password and isVerified false, so none of
 *    them is loggable-into;
 *  - --purge removes exactly what this script created, matched on that domain,
 *    and nothing else;
 *  - reviews are upserted on (product, user), which is the same unique index
 *    the app enforces, so re-running is idempotent rather than duplicating.
 *
 * Unlike scripts/seed.ts this never clears products, categories or settings.
 */

import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import mongoose from "mongoose";
import { User, Product, Review } from "../models";
import { SAMPLE_REVIEWS } from "./sample-reviews";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set. Add it to .env.local before seeding.");
  process.exit(1);
}

/** Reserved TLD — guaranteed never to belong to a real person. */
const SAMPLE_DOMAIN = "sample.invalid";
const SAMPLE_EMAIL_RE = new RegExp(`@${SAMPLE_DOMAIN.replace(".", "\\.")}$`, "i");

const purge = process.argv.includes("--purge");

/**
 * Recomputes ratingsAverage/ratingsCount from approved reviews.
 *
 * Deliberately duplicated from lib/recomputeProductRatings.ts rather than
 * imported: that helper pulls in lib/db (and the "@/..." path alias) which is
 * wired for the Next runtime, and a standalone tsx script shouldn't drag the
 * app's connection singleton in behind it. The rule it implements — approved
 * only, average rounded to one decimal — is identical.
 */
async function recompute(productId: mongoose.Types.ObjectId) {
  const [agg] = await Review.aggregate([
    { $match: { product: productId, isApproved: true } },
    { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  await Product.findByIdAndUpdate(productId, {
    ratingsAverage: agg ? Math.round(agg.avg * 10) / 10 : 0,
    ratingsCount: agg?.count ?? 0,
  });
}

async function runPurge() {
  const sampleUsers = await User.find({ email: SAMPLE_EMAIL_RE }).select("_id").lean();
  const ids = sampleUsers.map((u: any) => u._id);

  if (ids.length === 0) {
    console.log("No sample reviewers found — nothing to purge.");
    return;
  }

  // Collect affected products first, so ratings can be recomputed after the
  // reviews are gone rather than left pointing at deleted rows.
  const affected = await Review.distinct("product", { user: { $in: ids } });

  const { deletedCount } = await Review.deleteMany({ user: { $in: ids } });
  await User.deleteMany({ _id: { $in: ids } });

  for (const productId of affected) {
    await recompute(productId as mongoose.Types.ObjectId);
  }

  console.log(`Purged ${deletedCount} sample reviews and ${ids.length} sample reviewers.`);
  console.log(`Ratings recomputed for ${affected.length} products.`);
}

async function runSeed() {
  const slugs = Object.keys(SAMPLE_REVIEWS);
  const products = await Product.find({ slug: { $in: slugs } })
    .select("_id slug title")
    .lean();

  const bySlug = new Map(products.map((p: any) => [p.slug, p]));

  const missing = slugs.filter((s) => !bySlug.has(s));
  if (missing.length) {
    console.warn(
      `Skipping ${missing.length} slug(s) with no matching product: ${missing.join(", ")}`
    );
  }

  let reviewCount = 0;
  let userCount = 0;

  for (const slug of slugs) {
    const product: any = bySlug.get(slug);
    if (!product) continue;

    for (const r of SAMPLE_REVIEWS[slug]) {
      // One account per handle, reused across products — the same way a real
      // repeat customer would review more than one thing.
      const email = `${r.handle}@${SAMPLE_DOMAIN}`;
      const existing = await User.findOne({ email }).select("_id").lean();

      let userId: mongoose.Types.ObjectId;
      if (existing) {
        userId = (existing as any)._id;
      } else {
        const created = await User.create({
          name: r.name,
          email,
          provider: "credentials",
          role: "customer",
          isVerified: false, // no password set — these accounts cannot be signed into
        });
        userId = created._id as mongoose.Types.ObjectId;
        userCount++;
      }

      const createdAt = new Date(Date.now() - r.daysAgo * 24 * 60 * 60 * 1000);

      await Review.findOneAndUpdate(
        { product: product._id, user: userId },
        {
          product: product._id,
          user: userId,
          rating: r.rating,
          comment: r.comment,
          isApproved: true,
          createdAt,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      reviewCount++;
    }

    await recompute(product._id);
  }

  console.log("---");
  console.log(
    `Seeded ${reviewCount} sample reviews across ${products.length} products ` +
      `(${userCount} new sample reviewer accounts).`
  );
  console.log("");
  console.log("  ⚠  These reviews are SAMPLE DATA, not real customer feedback.");
  console.log("     Remove them before launch:  npm run seed:reviews -- --purge");
  console.log("---");
}

async function main() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);

  if (purge) {
    await runPurge();
  } else {
    await runSeed();
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Review seed failed:", err);
  process.exit(1);
});
