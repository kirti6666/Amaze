import mongoose, { Schema, models, model } from "mongoose";

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  parentCategory: mongoose.Types.ObjectId | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    image: { type: String },
    parentCategory: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// NOTE: no explicit index here — `unique: true` on the field already
// creates it. Declaring both makes Mongoose log a duplicate-index warning.
CategorySchema.index({ parentCategory: 1 });

export default models.Category || model<ICategory>("Category", CategorySchema);
