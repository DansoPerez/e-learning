import { prisma } from "@/lib/prisma";

export type CourseProgressState = {
  lessonCount: number;
  completedLessons: number;
  requiredQuizCount: number;
  passedQuizzes: number;
  progressPercent: number;
  isComplete: boolean;
};

/** Enabled quizzes with at least one question count toward completion. */
export async function calculateCourseProgress(
  userId: string,
  courseId: string,
): Promise<CourseProgressState> {
  const [lessons, requiredQuizzes] = await Promise.all([
    prisma.lesson.findMany({
      where: { module: { courseId } },
      select: { id: true },
    }),
    prisma.quiz.findMany({
      where: {
        courseId,
        isEnabled: true,
        questions: { some: {} },
      },
      select: { id: true },
    }),
  ]);

  const lessonCount = lessons.length;
  const requiredQuizCount = requiredQuizzes.length;
  const totalUnits = lessonCount + requiredQuizCount;

  if (totalUnits === 0) {
    return {
      lessonCount: 0,
      completedLessons: 0,
      requiredQuizCount: 0,
      passedQuizzes: 0,
      progressPercent: 0,
      isComplete: false,
    };
  }

  const [completedLessons, passedQuizGroups] = await Promise.all([
    prisma.lessonProgress.count({
      where: {
        userId,
        lessonId: { in: lessons.map((l) => l.id) },
        completed: true,
      },
    }),
    requiredQuizCount > 0 ?
      prisma.quizAttempt.groupBy({
        by: ["quizId"],
        where: {
          userId,
          quizId: { in: requiredQuizzes.map((q) => q.id) },
          passed: true,
        },
      })
    : Promise.resolve([]),
  ]);

  const passedQuizzes = passedQuizGroups.length;
  const completedUnits = completedLessons + passedQuizzes;
  const progressPercent = Math.min(
    100,
    Math.round((completedUnits / totalUnits) * 100),
  );
  const isComplete = completedUnits >= totalUnits;

  return {
    lessonCount,
    completedLessons,
    requiredQuizCount,
    passedQuizzes,
    progressPercent,
    isComplete,
  };
}

export async function getPassedQuizIds(userId: string, quizIds: string[]) {
  if (quizIds.length === 0) return new Set<string>();

  const passed = await prisma.quizAttempt.groupBy({
    by: ["quizId"],
    where: {
      userId,
      quizId: { in: quizIds },
      passed: true,
    },
  });

  return new Set(passed.map((p) => p.quizId));
}
