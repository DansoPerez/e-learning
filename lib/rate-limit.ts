import { prisma } from "@/lib/prisma";
import type { Role } from "@/app/generated/prisma/client";

type LimitResult = { ok: true } | { ok: false; retryAfterSec: number };

/** Fixed-window rate limit stored in PostgreSQL (works across serverless instances). */
export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
): Promise<LimitResult> {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const existing = await tx.rateLimitRecord.findUnique({ where: { key } });

    if (!existing || existing.resetAt <= now) {
      await tx.rateLimitRecord.upsert({
        where: { key },
        create: { key, count: 1, resetAt: new Date(now.getTime() + windowMs) },
        update: { count: 1, resetAt: new Date(now.getTime() + windowMs) },
      });
      return { ok: true as const };
    }

    if (existing.count >= maxAttempts) {
      const retryAfterSec = Math.max(
        1,
        Math.ceil((existing.resetAt.getTime() - now.getTime()) / 1000),
      );
      return { ok: false as const, retryAfterSec };
    }

    await tx.rateLimitRecord.update({
      where: { key },
      data: { count: { increment: 1 } },
    });

    return { ok: true as const };
  });
}

export function rateLimitKey(prefix: string, identifier: string): string {
  return `${prefix}:${identifier}`.slice(0, 200);
}

/** Restrict presence lookups to self, admins, conversation partners, or instructor students. */
export async function filterAllowedPresenceIds(
  viewerId: string,
  viewerRole: Role,
  targetIds: string[],
): Promise<string[]> {
  if (targetIds.length === 0) return [];

  const allowed = new Set<string>([viewerId]);

  if (viewerRole === "ADMIN") {
    return targetIds;
  }

  const convos = await prisma.conversation.findMany({
    where: {
      OR: [
        { studentId: viewerId, otherId: { in: targetIds } },
        { otherId: viewerId, studentId: { in: targetIds } },
      ],
    },
    select: { studentId: true, otherId: true },
  });
  for (const c of convos) {
    allowed.add(c.studentId);
    allowed.add(c.otherId);
  }

  if (viewerRole === "INSTRUCTOR") {
    const students = await prisma.enrollment.findMany({
      where: {
        userId: { in: targetIds },
        course: { instructorId: viewerId },
      },
      select: { userId: true },
      distinct: ["userId"],
    });
    for (const s of students) allowed.add(s.userId);
  }

  return targetIds.filter((id) => allowed.has(id));
}
