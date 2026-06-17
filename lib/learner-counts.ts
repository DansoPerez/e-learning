import { Prisma } from "@/app/generated/prisma/client";
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
  const [row] = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(DISTINCT e."userId")::bigint AS count
    FROM "Enrollment" e
    INNER JOIN "User" u ON u.id = e."userId"
    WHERE u.role = 'STUDENT'::"Role"
      AND u.status = 'ACTIVE'::"UserStatus"
  `;
  return Number(row?.count ?? 0);
}

/** Unique active students across all of an instructor's courses (excludes self-enrollment). */
export async function countDistinctInstructorLearners(
  instructorId: string,
): Promise<number> {
  const [row] = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(DISTINCT e."userId")::bigint AS count
    FROM "Enrollment" e
    INNER JOIN "User" u ON u.id = e."userId"
    INNER JOIN "Course" c ON c.id = e."courseId"
    WHERE c."instructorId" = ${instructorId}
      AND u.role = 'STUDENT'::"Role"
      AND u.status = 'ACTIVE'::"UserStatus"
      AND e."userId" <> c."instructorId"
  `;
  return Number(row?.count ?? 0);
}

/** Per-course learner counts for many courses in one query. */
export async function getLearnerCountsByCourseIds(
  courseIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  for (const id of courseIds) counts.set(id, 0);
  if (courseIds.length === 0) return counts;

  const rows = await prisma.$queryRaw<Array<{ courseId: string; learnerCount: bigint }>>`
    SELECT e."courseId" AS "courseId", COUNT(*)::bigint AS "learnerCount"
    FROM "Enrollment" e
    INNER JOIN "User" u ON u.id = e."userId"
    INNER JOIN "Course" c ON c.id = e."courseId"
    WHERE e."courseId" IN (${Prisma.join(courseIds)})
      AND u.role = 'STUDENT'::"Role"
      AND u.status = 'ACTIVE'::"UserStatus"
      AND e."userId" <> c."instructorId"
    GROUP BY e."courseId"
  `;

  for (const row of rows) {
    counts.set(row.courseId, Number(row.learnerCount));
  }
  return counts;
}
