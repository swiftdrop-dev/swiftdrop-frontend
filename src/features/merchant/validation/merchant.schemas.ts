import { z } from "zod";
const required = (max: number) =>
  z.string().trim().min(1, "This field is required.").max(max);
export const profileSchema = z.object({
  contactName: required(200),
  contactEmail: z.email().max(254),
  contactPhone: z
    .string()
    .regex(/^[+0-9() .-]{7,32}$/, "Enter a valid phone number."),
  pickupStreet: required(300),
  pickupCity: required(100),
  pickupDistrict: required(100),
});
export const onboardingSchema = profileSchema.extend({
  businessName: required(200),
  registrationNumber: required(100),
});
export const apiKeySchema = z.object({
  name: required(100),
  scopes: z
    .array(z.enum(["orders:read", "orders:write"]))
    .min(1, "Choose at least one scope.")
    .max(2),
  expiresAt: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value ||
        (Date.parse(value) > Date.now() &&
          Date.parse(value) <= Date.now() + 90 * 86400000),
      "Expiration must be in the future and within 90 days.",
    ),
});
