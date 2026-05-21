import { prisma } from "@/lib/prisma";
import type { NotificationType, Prisma } from "@/app/generated/prisma/client";

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      link: params.link,
      metadata: params.metadata,
    },
  });
}

export async function notifyConversationParticipants(
  conversationId: string,
  senderId: string,
  preview: string,
) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { studentId: true, otherId: true, type: true },
  });
  if (!conversation) return;

  const recipients = [conversation.studentId, conversation.otherId].filter(
    (id) => id !== senderId,
  );

  const link =
    conversation.type === "STUDENT_ADMIN" ?
      `/dashboard/student/messages/${conversationId}`
    : `/dashboard/student/messages/${conversationId}`;

  for (const userId of recipients) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    const roleLink =
      user?.role === "ADMIN" ?
        `/dashboard/admin/messages/${conversationId}`
      : user?.role === "INSTRUCTOR" ?
        `/dashboard/instructor/messages/${conversationId}`
      : link;

    await createNotification({
      userId,
      type: "MESSAGE",
      title: "New message",
      body: preview.slice(0, 120),
      link: roleLink,
      metadata: { conversationId },
    });
  }
}

export async function notifyReviewReply(
  reviewId: string,
  authorId: string,
  courseSlug: string,
  preview: string,
) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { userId: true, course: { select: { instructorId: true } } },
  });
  if (!review) return;

  const targets = new Set<string>();
  if (review.userId !== authorId) targets.add(review.userId);
  if (review.course.instructorId !== authorId) {
    targets.add(review.course.instructorId);
  }

  for (const userId of targets) {
    await createNotification({
      userId,
      type: "COMMENT_REPLY",
      title: "New reply on a review",
      body: preview.slice(0, 120),
      link: `/courses/${courseSlug}`,
      metadata: { reviewId },
    });
  }
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}
