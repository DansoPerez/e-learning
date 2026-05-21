import { z } from "zod";
import { normalizeEmail } from "@/lib/normalize-email";

export const verifyOtpSchema = z.object({
  email: z.email("Invalid email address").transform(normalizeEmail),
  code: z
    .string()
    .trim()
    .length(6, "Enter the 6-digit code")
    .regex(/^\d{6}$/, "Code must be 6 digits"),
});
