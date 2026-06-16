import { redirect } from "next/navigation";
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
  if (!course) {
    redirect("/dashboard/instructor/courses?error=course-not-found");
  }
  if (role !== "ADMIN" && course.instructorId !== userId) {
    redirect(`/dashboard/instructor/courses/${courseId}?error=unauthorized`);
  }
  return course;
}

/** Ensures module belongs to the given course. */
export async function assertModuleInCourse(moduleId: string, courseId: string) {
  const mod = await prisma.module.findFirst({
    where: { id: moduleId, courseId },
    select: { id: true },
  });
  if (!mod) {
    redirect(`/dashboard/instructor/courses/${courseId}?error=module-not-found`);
  }
}

/** Ensures quiz belongs to the given course. */
export async function assertQuizInCourse(quizId: string, courseId: string) {
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, courseId },
    select: { id: true },
  });
  if (!quiz) {
    redirect(`/dashboard/instructor/courses/${courseId}?error=quiz-not-found`);
  }
}
