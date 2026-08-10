import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  image: z.string().optional(),
  parentCategory: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categorySchema>;
