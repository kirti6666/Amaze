import { z } from "zod";

/**
 * Base coupon fields. `couponCreateSchema` requires all of them; the update
 * schema makes them optional (PATCH-style). A superRefine enforces the
 * "percent discount can't exceed 100" rule on both, tolerating undefined
 * values on updates.
 */
const couponBase = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Coupon code is too short")
    .max(40, "Coupon code is too long")
    .transform((s) => s.toUpperCase()),
  discountType: z.enum(["percent", "flat"], {
    errorMap: () => ({ message: "Discount type must be percent or flat" }),
  }),
  value: z.coerce.number().positive("Discount value must be greater than 0"),
  minOrderValue: z.coerce.number().min(0, "Minimum order value can't be negative").default(0),
  expiresAt: z.coerce.date({
    errorMap: () => ({ message: "A valid expiry date is required" }),
  }),
  usageLimit: z.coerce
    .number()
    .int("Usage limit must be a whole number")
    .min(0, "Usage limit can't be negative")
    .default(0), // 0 = unlimited
  isActive: z.boolean().default(true),
});

function percentCheck(
  d: { discountType?: "percent" | "flat"; value?: number },
  ctx: z.RefinementCtx
) {
  if (d.discountType === "percent" && typeof d.value === "number" && d.value > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "A percent discount can't exceed 100",
      path: ["value"],
    });
  }
}

export const couponCreateSchema = couponBase.superRefine(percentCheck);
export const couponUpdateSchema = couponBase.partial().superRefine(percentCheck);

export type CouponCreateInput = z.infer<typeof couponCreateSchema>;
export type CouponUpdateInput = z.infer<typeof couponUpdateSchema>;
