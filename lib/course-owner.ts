import { prisma } from "@/lib/prisma";
import type { Role } from "@/app/generated/prisma/client";

/** Ensures the user may edit the course (owner instructor or admin). */
export async function assertCanEditCourse(
  userId: string,
  role: Role,
  courseId: string,
) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, instructorId: true, slug: true },
  });
  if (!course) throw new Error("Course not found");
  if (role !== "ADMIN" && course.instructorId !== userId) {
    throw new Error("Unauthorized");
  }
  return course;
}

/** Ensures module belongs to the given course. */
export async function assertModuleInCourse(moduleId: string, courseId: string) {
  const mod = await prisma.module.findFirst({
    where: { id: moduleId, courseId },
    select: { id: true },
  });
  if (!mod) throw new Error("Module not found in this course");
}

/** Ensures quiz belongs to the given course. */
export async function assertQuizInCourse(quizId: string, courseId: string) {
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, courseId },
    select: { id: true },
  });
  if (!quiz) throw new Error("Quiz not found in this course");
}
