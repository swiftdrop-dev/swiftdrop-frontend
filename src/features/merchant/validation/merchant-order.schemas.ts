import { z } from "zod";
const text = (max: number) =>
  z.string().trim().min(1, "This field is required.").max(max);
const address = z.object({
  street: text(300),
  city: text(100),
  district: text(100),
  postalCode: z.string().max(20).optional().nullable(),
});
export const orderSchema = z.object({
  merchantOrderRef: text(100),
  recipient: z.object({
    name: text(200),
    phone: z
      .string()
      .regex(/^[+0-9() .-]{7,32}$/, "Enter a valid phone number."),
  }),
  pickupAddress: address,
  deliveryAddress: address,
  description: text(500),
  weightKg: z
    .number()
    .positive()
    .max(1000)
    .refine(
      (n) => Math.abs(n * 1000 - Math.round(n * 1000)) < 1e-7,
      "Use at most 3 decimal places.",
    ),
  size: z.enum(["XS", "SM", "MD", "LG", "XL"]),
  declaredValue: z
    .number()
    .min(0)
    .max(999999999999.99)
    .refine(
      (n) => Math.abs(n * 100 - Math.round(n * 100)) < 0.001,
      "Use at most 2 decimal places.",
    )
    .optional()
    .nullable(),
  fragile: z.boolean(),
  specialInstructions: z.string().max(1000).optional().nullable(),
  paymentMethod: z.enum(["COD", "ONLINE"]),
});
