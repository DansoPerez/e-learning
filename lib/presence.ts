import { prisma } from "@/lib/prisma";
import {
  isUserOnline,
  ONLINE_WITHIN_MS,
  onlineSinceDate,
} from "@/lib/presence-utils";

export {
  ONLINE_WITHIN_MS,
  formatLastSeen,
  isUserOnline,
  onlineSinceDate,
} from "@/lib/presence-utils";

const presenceUserSelect = {
  id: true,
  name: true,
  userCode: true,
  role: true,
  lastSeenAt: true,
  isSuperAdmin: true,
} as const;

/** Super admin: active users with presence (excludes other super admins from list optional - show all) */
export async function getPresenceUsersForSuperAdmin() {
  return prisma.user.findMany({
    where: { status: "ACTIVE", isSuperAdmin: false },
    select: presenceUserSelect,
    orderBy: [{ lastSeenAt: "desc" }, { name: "asc" }],
    take: 100,
  });
}

/** All enrolled students for instructor with presence */
export async function getEnrolledStudentsPresence(instructorId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      course: { instructorId },
      user: { role: "STUDENT", status: "ACTIVE" },
    },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          userCode: true,
          lastSeenAt: true,
        },
      },
    },
    distinct: ["userId"],
  });

  const byId = new Map<
    string,
    { id: string; name: string | null; userCode: string | null; lastSeenAt: Date | null }
  >();
  for (const e of enrollments) {
    if (e.user) byId.set(e.user.id, e.user);
  }
  return [...byId.values()].sort((a, b) => {
    const aOnline = isUserOnline(a.lastSeenAt);
    const bOnline = isUserOnline(b.lastSeenAt);
    if (aOnline !== bOnline) return aOnline ? -1 : 1;
    return (a.name ?? "").localeCompare(b.name ?? "");
  });
}

export async function touchPresence(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastSeenAt: new Date() },
    });
  } catch (err) {
    console.error("[presence] touchPresence failed:", err);
  }
}

/** Marks user offline immediately (e.g. sign-out or tab close) */
export async function markOffline(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { lastSeenAt: new Date(Date.now() - ONLINE_WITHIN_MS - 1) },
  });
}

export async function getOnlineUsersForSuperAdmin() {
  const since = onlineSinceDate();
  return prisma.user.findMany({
    where: { status: "ACTIVE", lastSeenAt: { gte: since } },
    select: {
      id: true,
      name: true,
      userCode: true,
      role: true,
      lastSeenAt: true,
    },
    orderBy: { lastSeenAt: "desc" },
    take: 50,
  });
}

export async function getOnlineStudentsForInstructor(instructorId: string) {
  const since = onlineSinceDate();
  const enrollments = await prisma.enrollment.findMany({
    where: {
      course: { instructorId },
      user: {
        role: "STUDENT",
        status: "ACTIVE",
        lastSeenAt: { gte: since },
      },
    },
    select: {
      user: {
        select: { id: true, name: true, userCode: true, lastSeenAt: true },
      },
    },
    distinct: ["userId"],
  });

  const byId = new Map<string, (typeof enrollments)[0]["user"]>();
  for (const e of enrollments) {
    if (e.user) byId.set(e.user.id, e.user);
  }
  return [...byId.values()];
}

export async function getOnlineUserIds(userIds: string[]): Promise<Set<string>> {
  if (userIds.length === 0) return new Set();
  const since = onlineSinceDate();
  const rows = await prisma.user.findMany({
    where: { id: { in: userIds }, lastSeenAt: { gte: since } },
    select: { id: true },
  });
  return new Set(rows.map((r) => r.id));
}
