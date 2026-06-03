"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { hasCourseAccess, updateCourseProgress } from "@/lib/services/enrollment";
import { touchLastLesson } from "@/lib/resume-lesson";
import { logAudit } from "@/lib/audit-log";
export async function markLessonCompleteAction(
  lessonId: string,
  courseSlug: string,
): Promise<void> {
  const user = await requireAuth();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { select: { courseId: true } } },
  });
  if (!lesson) throw new Error("Lesson not found");

  const allowed = await hasCourseAccess(user.id, lesson.module.courseId);
  if (!allowed) throw new Error("Access denied");

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    create: {
      userId: user.id,
      lessonId,
      completed: true,
      completedAt: new Date(),
    },
    update: { completed: true, completedAt: new Date() },
  });

  await updateCourseProgress(user.id, lesson.module.courseId);
  await touchLastLesson(user.id, lesson.module.courseId, lessonId);

  await logAudit({
    actorId: user.id,
    action: "LESSON_COMPLETE",
    targetType: "Lesson",
    targetId: lessonId,
    description: `Completed lesson in course ${lesson.module.courseId}`,
  });

  revalidatePath(`/learn/${courseSlug}`);
  revalidatePath("/dashboard/student");
  revalidatePath("/dashboard/student/courses");
}

export async function trackLessonViewAction(
  lessonId: string,
  courseSlug: string,
): Promise<void> {
  const user = await requireAuth();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { select: { courseId: true } } },
  });
  if (!lesson) throw new Error("Lesson not found");

  const allowed = await hasCourseAccess(user.id, lesson.module.courseId);
  if (!allowed) throw new Error("Access denied");

  await touchLastLesson(user.id, lesson.module.courseId, lessonId);
  revalidatePath(`/learn/${courseSlug}`);
}
