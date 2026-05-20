"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { scopesForRole } from "@/lib/announcements";

export async function markAnnouncementReadAction(announcementId: string): Promise<void> {
  const user = await requireAuth();

  const announcement = await prisma.announcement.findUnique({
    where: { id: announcementId },
    select: { scope: true },
  });
  if (!announcement) return;

  const allowed = scopesForRole(user.role).includes(announcement.scope);
  if (!allowed) return;

  await prisma.announcementRead.upsert({
    where: {
      userId_announcementId: { userId: user.id, announcementId },
    },
    create: { userId: user.id, announcementId },
    update: { readAt: new Date() },
  });

  revalidateDashboards(user.role);
}

export async function markAllAnnouncementsReadAction(): Promise<void> {
  const user = await requireAuth();
  const scopes = scopesForRole(user.role);

  const unread = await prisma.announcement.findMany({
    where: {
      scope: { in: scopes },
      reads: { none: { userId: user.id } },
    },
    select: { id: true },
  });

  if (unread.length === 0) return;

  await prisma.announcementRead.createMany({
    data: unread.map((a) => ({ userId: user.id, announcementId: a.id })),
    skipDuplicates: true,
  });

  revalidateDashboards(user.role);
}

function revalidateDashboards(role: string) {
  if (role === "STUDENT") revalidatePath("/dashboard/student");
  if (role === "INSTRUCTOR") revalidatePath("/dashboard/instructor");
  if (role === "ADMIN") {
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/student");
    revalidatePath("/dashboard/instructor");
  }
}
