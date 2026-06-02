import { z } from "zod";
import { normalizeEmail } from "@/lib/normalize-email";
import {
  confirmPasswordField,
  passwordSchema,
  refinePasswordMatch,
} from "@/lib/validations/password";

const registerBase = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address").transform(normalizeEmail),
  password: passwordSchema,
  confirmPassword: confirmPasswordField,
  role: z.enum(["STUDENT", "INSTRUCTOR"]).default("STUDENT"),
});

export const registerSchema = refinePasswordMatch(registerBase);

export const loginSchema = z.object({
  identifier: z.string().min(1, "User ID or email is required"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerBase>;
export type LoginInput = z.infer<typeof loginSchema>;
