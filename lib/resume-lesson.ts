import { prisma } from "@/lib/prisma";

/** First required quiz the user has not passed, in course order. */
export async function getFirstUnpassedQuizId(
  userId: string,
  courseId: string,
): Promise<string | null> {
  const quizzes = await prisma.quiz.findMany({
    where: {
      courseId,
      isEnabled: true,
      questions: { some: {} },
    },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (quizzes.length === 0) return null;

  const passed = await prisma.quizAttempt.groupBy({
    by: ["quizId"],
    where: {
      userId,
      quizId: { in: quizzes.map((q) => q.id) },
      passed: true,
    },
  });
  const passedSet = new Set(passed.map((p) => p.quizId));
  const next = quizzes.find((q) => !passedSet.has(q.id));
  return next?.id ?? null;
}

/** First incomplete lesson, or last visited if still incomplete, or first lesson. */
export async function getResumeLessonId(
  userId: string,
  courseId: string,
): Promise<string | null> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { lastLessonId: true },
  });

  const lessons = await prisma.lesson.findMany({
    where: { module: { courseId } },
    orderBy: [{ module: { orderIndex: "asc" } }, { orderIndex: "asc" }],
    select: { id: true },
  });

  if (lessons.length === 0) return null;

  const lessonIds = lessons.map((l) => l.id);
  const lessonIdSet = new Set(lessonIds);

  const completed = await prisma.lessonProgress.findMany({
    where: { userId, lessonId: { in: lessonIds }, completed: true },
    select: { lessonId: true },
  });
  const completedSet = new Set(completed.map((p) => p.lessonId));

  const firstIncomplete = lessonIds.find((id) => !completedSet.has(id));
  if (firstIncomplete) {
    if (
      enrollment?.lastLessonId &&
      lessonIdSet.has(enrollment.lastLessonId) &&
      !completedSet.has(enrollment.lastLessonId)
    ) {
      return enrollment.lastLessonId;
    }
    return firstIncomplete;
  }

  return null;
}

export async function touchLastLesson(
  userId: string,
  courseId: string,
  lessonId: string,
): Promise<void> {
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId, lastLessonId: lessonId },
    update: { lastLessonId: lessonId, updatedAt: new Date() },
  });
}
