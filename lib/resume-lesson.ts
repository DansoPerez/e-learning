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
  return quizzes.find((q) => !passedSet.has(q.id))?.id ?? null;
}

/** First incomplete lesson, or last visited if still incomplete, or first lesson. */
export async function getResumeLessonId(
  userId: string,
  courseId: string,
): Promise<string | null> {
  const [enrollment, lessons, completed] = await Promise.all([
    prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { lastLessonId: true },
    }),
    prisma.lesson.findMany({
      where: { module: { courseId } },
      orderBy: [{ module: { orderIndex: "asc" } }, { orderIndex: "asc" }],
      select: { id: true },
    }),
    prisma.lessonProgress.findMany({
      where: {
        userId,
        completed: true,
        lesson: { module: { courseId } },
      },
      select: { lessonId: true },
    }),
  ]);

  if (lessons.length === 0) return null;

  const lessonIds = lessons.map((l) => l.id);
  const completedSet = new Set(completed.map((p) => p.lessonId));
  const firstIncomplete = lessonIds.find((id) => !completedSet.has(id));

  if (firstIncomplete) {
    if (
      enrollment?.lastLessonId &&
      lessonIds.includes(enrollment.lastLessonId) &&
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
