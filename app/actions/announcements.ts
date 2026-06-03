"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { canReadAnnouncement, scopesForRole } from "@/lib/announcements";
import { logAudit } from "@/lib/audit-log";
import { z } from "zod";

const courseAnnouncementSchema = z.object({
  message: z.string().min(1, "Message is required").max(5000),
});

export async function markAnnouncementReadAction(announcementId: string): Promise<void> {
  const user = await requireAuth();

  const announcement = await prisma.announcement.findUnique({
    where: { id: announcementId },
    select: { scope: true, courseId: true },
  });
  if (!announcement) return;

  const allowed = await canReadAnnouncement(user.id, user.role, announcement);
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

  const announcements = await prisma.announcement.findMany({
    where: {
      reads: { none: { userId: user.id } },
    },
    select: { id: true, scope: true, courseId: true },
    take: 100,
  });

  const readable = [];
  for (const a of announcements) {
    if (await canReadAnnouncement(user.id, user.role, a)) {
      readable.push(a.id);
    }
  }

  if (readable.length === 0) return;

  await prisma.announcementRead.createMany({
    data: readable.map((id) => ({ userId: user.id, announcementId: id })),
  });

  revalidateDashboards(user.role);
}

/** Instructor publishes an announcement to enrolled students of a course. */
export async function createCourseAnnouncementAction(
  courseId: string,
  _prev: { error?: string; success?: boolean },
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireRole("INSTRUCTOR", "ADMIN");

  const parsed = courseAnnouncementSchema.safeParse({
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid message" };
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true, title: true },
  });
  if (!course) return { error: "Course not found" };
  if (course.instructorId !== user.id && user.role !== "ADMIN") {
    return { error: "Access denied" };
  }

  await prisma.announcement.create({
    data: {
      authorId: user.id,
      courseId,
      message: parsed.data.message.trim(),
      scope: "COURSE",
    },
  });

  await logAudit({
    actorId: user.id,
    action: "CREATE_COURSE_ANNOUNCEMENT",
    targetType: "Course",
    targetId: courseId,
    description: `Course announcement for "${course.title}"`,
  });

  revalidatePath(`/dashboard/instructor/courses/${courseId}`);
  revalidatePath("/dashboard/student");
  return { success: true };
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
