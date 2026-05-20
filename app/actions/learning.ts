"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { hasCourseAccess, updateCourseProgress } from "@/lib/services/enrollment";
export async function markLessonCompleteAction(
  lessonId: string,
  courseSlug: string,
): Promise<void> {
  const user = await requireAuth();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { select: { courseId: true } } },
  });
  if (!lesson) return;

  const allowed = await hasCourseAccess(user.id, lesson.module.courseId);
  if (!allowed) return;

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
  revalidatePath(`/learn/${courseSlug}`);
}
