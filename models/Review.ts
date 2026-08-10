import mongoose, { Schema, models, model } from "mongoose";

export interface IReview {
  _id: string;
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  isApproved: boolean;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    isApproved: { type: Boolean, default: true }, // admin can moderate; flip to false to hide
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ReviewSchema.index({ product: 1 });
// A user can only leave one review per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

export default models.Review || model<IReview>("Review", ReviewSchema);
