import { z } from "zod";
import { isValidVideoUrl } from "@/lib/video-embed";
import { optionalNonNegativeInt, requiredNonNegativeInt } from "@/lib/validations/numbers";

export const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  categoryId: z.string().optional(),
  price: z.coerce.number().min(0, "Price cannot be negative"),
});

export const moduleSchema = z.object({
  title: z.string().min(2, "Module title is required"),
  orderIndex: requiredNonNegativeInt,
});

export const lessonSchema = z.object({
  title: z.string().min(2, "Lesson title is required"),
  content: z.string().optional(),
  videoUrl: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || isValidVideoUrl(val), {
      message: "Enter a valid YouTube, Vimeo, Cloudinary, or direct video (.mp4) URL",
    }),
  orderIndex: requiredNonNegativeInt,
  durationMin: optionalNonNegativeInt,
});

export const instructorApplicationSchema = z.object({
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  expertise: z.string().min(2, "Expertise is required"),
  experienceYears: z.coerce.number().int().min(0).max(50),
  qualification: z.string().min(2, "Qualification is required"),
  selfieUrl: z.string().min(1, "Live selfie verification is required"),
});

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(3, "Comment must be at least 3 characters").max(1000),
});

export const reviewReplySchema = z.object({
  body: z.string().min(1, "Reply cannot be empty").max(2000),
});

export const announcementSchema = z.object({
  message: z.string().min(5, "Message is required"),
  scope: z.enum(["STUDENTS", "INSTRUCTORS", "COURSE"]),
  courseId: z.string().optional(),
});

export const withdrawalSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  note: z.string().max(500).optional(),
});
