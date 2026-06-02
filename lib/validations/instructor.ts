import { z } from "zod";
import { normalizeEmail } from "@/lib/normalize-email";
import {
  confirmPasswordField,
  passwordSchema,
  refinePasswordMatch,
} from "@/lib/validations/password";

export const instructorApplicationFieldsSchema = z.object({
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  expertise: z.string().min(2, "Expertise is required"),
  experienceYears: z.coerce.number().int().min(0, "Enter years of experience").max(50),
  qualification: z.string().min(2, "Qualification is required"),
  selfieUrl: z.string().min(1, "Live selfie verification is required"),
});

const instructorRegisterBase = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address").transform(normalizeEmail),
  password: passwordSchema,
  confirmPassword: confirmPasswordField,
  role: z.literal("INSTRUCTOR"),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  expertise: z.string().min(2, "Expertise is required"),
  experienceYears: z.coerce.number().int().min(0).max(50),
  qualification: z.string().min(2, "Qualification is required"),
  selfieUrl: z.string().min(1, "You must capture a live selfie before registering"),
});

export const instructorRegisterSchema = refinePasswordMatch(instructorRegisterBase);

export type InstructorRegisterInput = z.infer<typeof instructorRegisterBase>;
