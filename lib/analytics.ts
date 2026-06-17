import { prisma } from "@/lib/prisma";
import { onlineSinceDate } from "@/lib/presence-utils";
import {
  countDistinctInstructorLearners,
  countDistinctPlatformLearners,
  getLearnerCountsByCourseIds,
  learnerUserWhere,
} from "@/lib/learner-counts";

export async function getAdminAnalytics() {
  const since = onlineSinceDate();

  const [
    totalUsers,
    activeUsers,
    publishedCourses,
    totalEnrollments,
    distinctLearners,
    revenue,
    quizAttempts,
    pendingInstructors,
    pendingCourses,
    topCoursesRaw,
    quizStats,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: { status: "ACTIVE", lastSeenAt: { gte: since } },
    }),
    prisma.course.count({ where: { status: "PUBLISHED" } }),
    prisma.enrollment.count(),
    countDistinctPlatformLearners(),
    prisma.payment.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true, platformShare: true, instructorShare: true },
    }),
    prisma.quizAttempt.count(),
    prisma.instructorProfile.count({ where: { status: "PENDING" } }),
    prisma.course.count({ where: { status: "PENDING" } }),
    prisma.course.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        slug: true,
        _count: { select: { enrollments: true, reviews: true } },
      },
      take: 50,
    }),
    prisma.quizAttempt.groupBy({
      by: ["passed"],
      _count: { id: true },
      _avg: { score: true },
    }),
  ]);

  const passedCount = quizStats.find((g) => g.passed)?._count.id ?? 0;
  const avgScore =
    quizStats.reduce((sum, g) => sum + (g._avg.score ?? 0) * g._count.id, 0) /
    Math.max(1, quizAttempts);

  const topCourses = [...topCoursesRaw]
    .slice(0, 50);

  const learnerCountsByCourse = await getLearnerCountsByCourseIds(
    topCourses.map((c) => c.id),
  );

  const topCoursesByLearners = topCourses
    .map((c) => ({
      ...c,
      learnerCount: learnerCountsByCourse.get(c.id) ?? 0,
    }))
    .sort((a, b) => b.learnerCount - a.learnerCount)
    .slice(0, 8);

  return {
    totalUsers,
    activeUsers,
    publishedCourses,
    totalEnrollments,
    distinctLearners,
    revenue: {
      total: Number(revenue._sum.amount ?? 0),
      platform: Number(revenue._sum.platformShare ?? 0),
      instructor: Number(revenue._sum.instructorShare ?? 0),
    },
    quizAttempts,
    quizPassRate:
      quizAttempts > 0 ? Math.round((passedCount / quizAttempts) * 100) : 0,
    quizAvgScore: Math.round(avgScore),
    pendingInstructors,
    pendingCourses,
    topCourses: topCoursesByLearners,
  };
}

export async function getInstructorAnalytics(instructorId: string) {
  const courses = await prisma.course.findMany({
    where: { instructorId },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      _count: { select: { enrollments: true, quizzes: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const courseIds = courses.map((c) => c.id);

  const [payments, enrollments, attempts, studentProgress, learnerCountsByCourse, distinctLearners] =
    await Promise.all([
    prisma.payment.aggregate({
      where: { courseId: { in: courseIds }, status: "SUCCESS" },
      _sum: { instructorShare: true },
    }),
    prisma.enrollment.findMany({
      where: {
        courseId: { in: courseIds },
        user: learnerUserWhere,
        userId: { not: instructorId },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { title: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
    prisma.quizAttempt.findMany({
      where: { quiz: { courseId: { in: courseIds } } },
      include: {
        user: { select: { name: true, email: true } },
        quiz: { select: { title: true, course: { select: { title: true } } } },
      },
      orderBy: { startedAt: "desc" },
      take: 30,
    }),
    prisma.enrollment.groupBy({
      by: ["courseId"],
      where: {
        courseId: { in: courseIds },
        user: learnerUserWhere,
        userId: { not: instructorId },
      },
      _avg: { progressPercent: true },
      _count: { id: true },
    }),
    getLearnerCountsByCourseIds(courseIds),
    countDistinctInstructorLearners(instructorId),
  ]);

  const progressByCourse = new Map(
    studentProgress.map((p) => [
      p.courseId,
      {
        avgProgress: Math.round(p._avg.progressPercent ?? 0),
        count: p._count.id,
      },
    ]),
  );

  return {
    courses: courses.map((c) => ({
      ...c,
      enrollments: learnerCountsByCourse.get(c.id) ?? 0,
      quizzes: c._count.quizzes,
      avgProgress: progressByCourse.get(c.id)?.avgProgress ?? 0,
    })),
    distinctLearners,
    totalEarnings: Number(payments._sum.instructorShare ?? 0),
    recentEnrollments: enrollments,
    recentQuizAttempts: attempts,
  };
}
