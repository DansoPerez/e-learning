import { prisma } from "@/lib/prisma";
import { isEmailConfigured, sendWithdrawalRequestAdminEmail } from "@/lib/email";
import { getPaystackCurrency } from "@/lib/paystack-config";
import { formatCurrency } from "@/lib/utils";
import type { NotificationType, Prisma } from "@/app/generated/prisma/client";

function getAppUrl(): string {
  const base = process.env.NEXTAUTH_URL?.trim() || process.env.AUTH_URL?.trim() || "http://localhost:3000";
  return base.replace(/\/$/, "");
}

async function getSensitiveAdminRecipients() {
  return prisma.user.findMany({
    where: {
      role: "ADMIN",
      status: "ACTIVE",
      OR: [
        { isSuperAdmin: true },
        { adminSensitiveApproved: true, adminSensitiveSuspended: false },
      ],
    },
    select: { id: true, email: true },
  });
}

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

export async function notifyAdminsOfWithdrawalRequest(params: {
  withdrawalId: string;
  instructorName: string;
  instructorUserCode: string | null;
  instructorEmail: string;
  amount: number;
  note?: string | null;
}) {
  const admins = await getSensitiveAdminRecipients();
  const amountLabel = formatCurrency(params.amount, getPaystackCurrency());
  const instructorLabel =
    params.instructorUserCode ?
      `${params.instructorName} (${params.instructorUserCode})`
    : params.instructorName;

  for (const admin of admins) {
    await createNotification({
      userId: admin.id,
      type: "WITHDRAWAL",
      title: "New withdrawal request",
      body: `${instructorLabel} requested ${amountLabel}`,
      link: "/dashboard/admin/withdrawals",
      metadata: { withdrawalId: params.withdrawalId },
    });
  }

  if (!isEmailConfigured()) return;

  const emails = new Set(admins.map((admin) => admin.email).filter(Boolean));
  const extraInbox = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();
  if (extraInbox) emails.add(extraInbox);

  if (emails.size === 0) return;

  try {
    await sendWithdrawalRequestAdminEmail({
      to: [...emails],
      instructorName: params.instructorName,
      instructorUserCode: params.instructorUserCode,
      instructorEmail: params.instructorEmail,
      amountLabel,
      note: params.note,
      reviewUrl: `${getAppUrl()}/dashboard/admin/withdrawals`,
    });
  } catch (error) {
    console.error("[notifications] Failed to email admins about withdrawal:", error);
  }
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}
