import { z } from "zod";

export const PASSWORD_REQUIREMENTS = [
  "At least 8 characters",
  "At least one letter (a–z or A–Z)",
  "At least one number (0–9)",
  "At least one symbol (!@#$%^&* etc.)",
] as const;

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-zA-Z]/, "Password must contain a letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain a symbol");

export const confirmPasswordField = z
  .string()
  .min(1, "Please confirm your password");

export function refinePasswordMatch<T extends { password: string; confirmPassword: string }>(
  schema: z.ZodType<T>,
) {
  return schema.refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
}
