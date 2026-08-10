import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Name is required"),
  phone: z.string().trim().min(7, "Enter a valid phone number"),
  line1: z.string().trim().min(3, "Address is required"),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  pincode: z.string().trim().min(4, "Enter a valid pincode"),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;
