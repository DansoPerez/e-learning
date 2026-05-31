import { z } from "zod";
import { optionalDurationMin, requiredNonNegativeInt } from "@/lib/validations/numbers";

export const quizSchema = z.object({
  title: z.string().min(3, "Quiz title is required"),
  durationMin: optionalDurationMin,
  passingScore: z.coerce.number().int().min(0).max(100).default(70),
});

export const questionSchema = z.object({
  question: z.string().min(5, "Question text is required"),
  type: z.enum(["MCQ", "TRUE_FALSE"]),
  options: z.array(z.string().min(1)).optional(),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  orderIndex: requiredNonNegativeInt,
});
