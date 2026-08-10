import mongoose, { Schema, models, model } from "mongoose";

export interface IVariantAttribute {
  name: string; // e.g. "Size"
  options: string[]; // e.g. ["S", "M", "L"]
}

export interface IVariantCombination {
  combination: Map<string, string>; // e.g. { Size: "M", Color: "Red" }
  sku?: string;
  stock: number;
  price?: number; // overrides base price if set
  image?: string;
}

export interface IProduct {
  _id: string;
  title: string;
  slug: string;
  description: string;
  images: string[];
  category: mongoose.Types.ObjectId;
  price: number;
  discountPrice?: number;
  sku?: string;
  stock: number; // used only when there are no variants
  variants: IVariantAttribute[];
  variantCombinations: IVariantCombination[];
  tags: string[];
  ratingsAverage: number;
  ratingsCount: number;
  isFeatured: boolean;
  isBestseller: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VariantAttributeSchema = new Schema<IVariantAttribute>(
  {
    name: { type: String, required: true },
    options: [{ type: String, required: true }],
  },
  { _id: false }
);

const VariantCombinationSchema = new Schema<IVariantCombination>(
  {
    combination: { type: Map, of: String, required: true },
    sku: { type: String },
    stock: { type: Number, required: true, default: 0 },
    price: { type: Number },
    image: { type: String },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    sku: { type: String },
    stock: { type: Number, default: 0 },
    variants: [VariantAttributeSchema],
    variantCombinations: [VariantCombinationSchema],
    tags: [{ type: String }],
    ratingsAverage: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    // Manually curated: a new store has no order history to derive this from.
    isBestseller: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// NOTE: no explicit index here — `unique: true` on the field already
// creates it. Declaring both makes Mongoose log a duplicate-index warning.
ProductSchema.index({ category: 1 });
ProductSchema.index({ title: "text", description: "text" });

export default models.Product || model<IProduct>("Product", ProductSchema);
