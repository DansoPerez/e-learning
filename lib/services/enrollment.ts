import { prisma } from "@/lib/prisma";

async function getUserAccessFlags(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, status: true, allCoursesAccess: true },
  });
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

  if (course.status !== "PUBLISHED") return false;

  if (user.allCoursesAccess) {
    await ensureEnrollment(userId, courseId);
    return true;
  }

  const price = Number(course.price);
  if (price === 0) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    return !!enrollment;
  }

  const [enrollment, payment] = await Promise.all([
    prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    }),
    prisma.payment.findFirst({
      where: { userId, courseId, status: "SUCCESS" },
    }),
  ]);

  return !!enrollment && !!payment;
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

  if (Number(course.price) > 0) {
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
  const lessons = await prisma.lesson.findMany({
    where: { module: { courseId } },
    select: { id: true },
  });

  if (lessons.length === 0) return;

  const completed = await prisma.lessonProgress.count({
    where: {
      userId,
      lessonId: { in: lessons.map((l) => l.id) },
      completed: true,
    },
  });

  const progressPercent = Math.round((completed / lessons.length) * 100);

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId, progressPercent },
    update: {
      progressPercent,
      completedAt: progressPercent >= 100 ? new Date() : null,
    },
  });
}
