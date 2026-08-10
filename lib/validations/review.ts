import { z } from "zod";

export const reviewSchema = z.object({
  // Product being reviewed (Mongo ObjectId as a string).
  product: z.string().trim().min(1, "Product is required"),
  rating: z.coerce.number().int().min(1, "Rating is required").max(5, "Rating must be 1-5"),
  comment: z.string().trim().max(2000, "Comment is too long").optional().default(""),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
