import { Schema, models, model } from "mongoose";

export interface ICoupon {
  _id: string;
  code: string;
  discountType: "percent" | "flat";
  value: number;
  minOrderValue: number;
  expiresAt: Date;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["percent", "flat"], required: true },
    value: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    usageLimit: { type: Number, default: 0 }, // 0 = unlimited
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// NOTE: no explicit index here — `unique: true` on the field already
// creates it. Declaring both makes Mongoose log a duplicate-index warning.

export default models.Coupon || model<ICoupon>("Coupon", CouponSchema);
