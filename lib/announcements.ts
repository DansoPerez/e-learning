import { prisma } from "@/lib/prisma";
import type { AnnouncementScope, Role } from "@/app/generated/prisma/client";

export function scopesForRole(role: Role): AnnouncementScope[] {
  switch (role) {
    case "INSTRUCTOR":
      return ["INSTRUCTORS"];
    case "STUDENT":
      return ["STUDENTS", "COURSE"];
    case "ADMIN":
      return ["STUDENTS", "INSTRUCTORS", "COURSE"];
    default:
      return ["STUDENTS"];
  }
}

export async function getAnnouncementsForUser(userId: string, role: Role) {
  const scopes = scopesForRole(role);

  const enrolledCourseIds =
    role === "STUDENT" ?
      (
        await prisma.enrollment.findMany({
          where: { userId },
          select: { courseId: true },
        })
      ).map((e) => e.courseId)
    : [];

  const instructorCourseIds =
    role === "INSTRUCTOR" ?
      (
        await prisma.course.findMany({
          where: { instructorId: userId },
          select: { id: true },
        })
      ).map((c) => c.id)
    : [];

  const announcements = await prisma.announcement.findMany({
    where: {
      OR: [
        { scope: { in: scopes.filter((s) => s !== "COURSE") } },
        ...(role === "STUDENT" && enrolledCourseIds.length > 0 ?
          [{ scope: "COURSE" as const, courseId: { in: enrolledCourseIds } }]
        : role === "INSTRUCTOR" && instructorCourseIds.length > 0 ?
          [{ scope: "COURSE" as const, courseId: { in: instructorCourseIds } }]
        : role === "ADMIN" ?
          [{ scope: "COURSE" as const }]
        : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true } },
      course: { select: { title: true } },
      reads: { where: { userId }, select: { id: true } },
    },
  });

  return announcements.map((a) => ({
    id: a.id,
    message: a.message,
    scope: a.scope,
    courseTitle: a.course?.title ?? null,
    createdAt: a.createdAt,
    authorName: a.author.name ?? "Admin",
    read: a.reads.length > 0,
  }));
}

export async function canReadAnnouncement(
  userId: string,
  role: Role,
  announcement: { scope: AnnouncementScope; courseId: string | null },
): Promise<boolean> {
  if (!scopesForRole(role).includes(announcement.scope)) {
    if (announcement.scope !== "COURSE") return false;
  }

  if (announcement.scope !== "COURSE") return true;
  if (role === "ADMIN") return true;
  if (!announcement.courseId) return false;

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId: announcement.courseId },
    },
  });
  return !!enrollment;
}
