import { prisma } from "@/lib/prisma";

/** Active students only — excludes instructors, admins, and suspended accounts. */
export const learnerUserWhere = {
  role: "STUDENT" as const,
  status: "ACTIVE" as const,
};

/** Learners enrolled in one course (excludes the course owner). */
export async function countCourseLearners(
  courseId: string,
  instructorId: string,
): Promise<number> {
  return prisma.enrollment.count({
    where: {
      courseId,
      userId: { not: instructorId },
      user: learnerUserWhere,
    },
  });
}

/** Unique active students with at least one enrollment platform-wide. */
export async function countDistinctPlatformLearners(): Promise<number> {
  const groups = await prisma.enrollment.groupBy({
    by: ["userId"],
    where: { user: learnerUserWhere },
  });
  return groups.length;
}

/** Unique active students across all of an instructor's courses (excludes self-enrollment). */
export async function countDistinctInstructorLearners(
  instructorId: string,
): Promise<number> {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      course: { instructorId },
      user: learnerUserWhere,
    },
    select: {
      userId: true,
      course: { select: { instructorId: true } },
    },
  });

  const learnerIds = new Set<string>();
  for (const enrollment of enrollments) {
    if (enrollment.userId !== enrollment.course.instructorId) {
      learnerIds.add(enrollment.userId);
    }
  }
  return learnerIds.size;
}

/** Per-course learner counts for many courses in one query. */
export async function getLearnerCountsByCourseIds(
  courseIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  for (const id of courseIds) counts.set(id, 0);
  if (courseIds.length === 0) return counts;

  const courses = await prisma.course.findMany({
    where: { id: { in: courseIds } },
    select: { id: true, instructorId: true },
  });
  const instructorByCourse = new Map(courses.map((c) => [c.id, c.instructorId]));

  const enrollments = await prisma.enrollment.findMany({
    where: {
      courseId: { in: courseIds },
      user: learnerUserWhere,
    },
    select: { courseId: true, userId: true },
  });

  for (const enrollment of enrollments) {
    if (enrollment.userId === instructorByCourse.get(enrollment.courseId)) continue;
    counts.set(enrollment.courseId, (counts.get(enrollment.courseId) ?? 0) + 1);
  }

  return counts;
}
