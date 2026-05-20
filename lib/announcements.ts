import { prisma } from "@/lib/prisma";
import type { AnnouncementScope, Role } from "@/app/generated/prisma/client";

export function scopesForRole(role: Role): AnnouncementScope[] {
  switch (role) {
    case "INSTRUCTOR":
      return ["INSTRUCTORS"];
    case "STUDENT":
      return ["STUDENTS"];
    case "ADMIN":
      return ["STUDENTS", "INSTRUCTORS", "COURSE"];
    default:
      return ["STUDENTS"];
  }
}

export async function getAnnouncementsForUser(userId: string, role: Role) {
  const scopes = scopesForRole(role);

  const announcements = await prisma.announcement.findMany({
    where: { scope: { in: scopes } },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true } },
      reads: { where: { userId }, select: { id: true } },
    },
  });

  return announcements.map((a) => ({
    id: a.id,
    message: a.message,
    scope: a.scope,
    createdAt: a.createdAt,
    authorName: a.author.name ?? "Admin",
    read: a.reads.length > 0,
  }));
}
