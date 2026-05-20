import { z } from "zod";

export const instructorApplicationFieldsSchema = z.object({
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  expertise: z.string().min(2, "Expertise is required"),
  experienceYears: z.coerce.number().int().min(0, "Enter years of experience").max(50),
  qualification: z.string().min(2, "Qualification is required"),
  selfieUrl: z.string().min(1, "Live selfie verification is required"),
});

export const instructorRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain a letter")
    .regex(/[0-9]/, "Password must contain a number"),
  role: z.literal("INSTRUCTOR"),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  expertise: z.string().min(2, "Expertise is required"),
  experienceYears: z.coerce.number().int().min(0).max(50),
  qualification: z.string().min(2, "Qualification is required"),
  selfieUrl: z.string().min(1, "You must capture a live selfie before registering"),
});
