import { z } from "zod";

const variantAttributeSchema = z.object({
  name: z.string().min(1),
  options: z.array(z.string().min(1)).min(1),
});

const variantCombinationSchema = z.object({
  combination: z.record(z.string()),
  sku: z.string().optional(),
  stock: z.number().min(0),
  price: z.number().positive().optional(),
  image: z.string().optional(),
});

export const productSchema = z.object({
  title: z.string().trim().min(2, "Title is required"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  price: z.number().positive("Price must be greater than 0"),
  discountPrice: z.number().positive().optional(),
  sku: z.string().optional(),
  // Images are optional so the catalogue can go live before photography
  // exists; ProductCard renders a styled empty state when the array is empty.
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  isActive: z.boolean().default(true),
  variants: z.array(variantAttributeSchema).default([]),
  variantCombinations: z.array(variantCombinationSchema).default([]),
  stock: z.number().min(0).default(0),
});

export type ProductInput = z.infer<typeof productSchema>;
