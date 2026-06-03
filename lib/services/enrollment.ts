import { prisma } from "@/lib/prisma";
import { chargesForCourse } from "@/lib/course-pricing";
import { calculateCourseProgress } from "@/lib/course-completion";
import { ensureCompPayment } from "@/lib/services/payment";
import type { CourseStatus } from "@/app/generated/prisma/client";

/** Students with enrollment retain access when a course is hidden from the catalog. */
const ENROLLED_ACCESS_STATUSES: CourseStatus[] = ["PUBLISHED", "HIDDEN"];

async function getUserAccessFlags(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, status: true, allCoursesAccess: true },
  });
}

async function hasSuccessfulPayment(userId: string, courseId: string) {
  const payment = await prisma.payment.findFirst({
    where: { userId, courseId, status: "SUCCESS" },
  });
  return !!payment;
}

export async function hasCourseAccess(userId: string, courseId: string) {
  const [user, course] = await Promise.all([
    getUserAccessFlags(userId),
    prisma.course.findUnique({
      where: { id: courseId },
      select: { price: true, status: true, instructorId: true },
    }),
  ]);

  if (!user || user.status !== "ACTIVE") return false;
  if (!course) return false;

  if (user.role === "ADMIN") return true;
  if (course.instructorId === userId) return true;

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  const paid = chargesForCourse(Number(course.price));

  if (
    user.allCoursesAccess &&
    (course.status === "PUBLISHED" || course.status === "HIDDEN")
  ) {
    if (!enrollment) await ensureEnrollment(userId, courseId);
    return true;
  }

  if (enrollment && ENROLLED_ACCESS_STATUSES.includes(course.status)) {
    if (!paid) return true;
    if (await hasSuccessfulPayment(userId, courseId)) return true;
  }

  if (paid && !enrollment && (await hasSuccessfulPayment(userId, courseId))) {
    await ensureEnrollment(userId, courseId);
    return true;
  }

  if (course.status !== "PUBLISHED") return false;

  if (!paid) {
    return !!enrollment;
  }

  return !!enrollment && (await hasSuccessfulPayment(userId, courseId));
}

export async function ensureEnrollment(userId: string, courseId: string) {
  return prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId },
    update: {},
  });
}

export async function enrollInFreeCourse(userId: string, courseId: string) {
  const user = await getUserAccessFlags(userId);
  if (!user || user.status !== "ACTIVE") {
    throw new Error("User is not active");
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.status !== "PUBLISHED") {
    throw new Error("Course is not available for enrollment");
  }

  if (user.allCoursesAccess || user.role === "ADMIN") {
    return ensureEnrollment(userId, courseId);
  }

  if (chargesForCourse(Number(course.price))) {
    throw new Error("This course requires payment");
  }

  return ensureEnrollment(userId, courseId);
}

export async function enrollUserInAllPublishedCourses(userId: string) {
  const courses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true },
  });

  for (const course of courses) {
    await ensureEnrollment(userId, course.id);
  }

  return courses.length;
}

export async function updateCourseProgress(userId: string, courseId: string) {
  const state = await calculateCourseProgress(userId, courseId);

  if (state.lessonCount === 0 && state.requiredQuizCount === 0) return;

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { completedAt: true },
  });

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: {
      userId,
      courseId,
      progressPercent: state.progressPercent,
      completedAt: state.isComplete ? new Date() : null,
    },
    update: {
      progressPercent: state.progressPercent,
      completedAt:
        state.isComplete ?
          (existing?.completedAt ?? new Date())
        : null,
    },
  });
}

/** Recalculate stored progress for all enrollments in a course (after curriculum changes). */
export async function recalculateCourseEnrollments(courseId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    select: { userId: true },
  });

  for (const { userId } of enrollments) {
    await updateCourseProgress(userId, courseId);
  }
}

/** Admin comp enrollment: grant access including paid courses. */
export async function adminEnrollUserInCourse(userId: string, courseId: string) {
  await ensureEnrollment(userId, courseId);
  await ensureCompPayment(userId, courseId);
}

/** Removes enrollment and voids payments so access cannot be restored automatically. */
export async function revokeCourseEnrollment(userId: string, courseId: string) {
  await prisma.$transaction([
    prisma.enrollment.deleteMany({ where: { userId, courseId } }),
    prisma.payment.updateMany({
      where: { userId, courseId, status: { in: ["SUCCESS", "PENDING"] } },
      data: { status: "FAILED" },
    }),
  ]);
}
