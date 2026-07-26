import { prisma } from "@/lib/prisma";
import {
  isEmailConfigured,
  sendInstructorApprovedWelcomeEmail,
  sendInstructorPendingAdminEmail,
  sendNewStudentAdminEmail,
  sendPurchaseSuccessEmail,
  sendWithdrawalRequestAdminEmail,
} from "@/lib/email";
import { getPaystackCurrency } from "@/lib/paystack-config";
import { formatCurrency } from "@/lib/utils";
import { getWelcomeSuggestedCourses } from "@/lib/welcome-offer";
import type { NotificationType, Prisma } from "@/app/generated/prisma/client";

function getAppUrl(): string {
  const base =
    process.env.NEXTAUTH_URL?.trim() || process.env.AUTH_URL?.trim() || "http://localhost:3000";
  return base.replace(/\/$/, "");
}

async function getAdminUsersForAlerts() {
  return prisma.user.findMany({
    where: { role: "ADMIN", status: "ACTIVE" },
    select: { id: true, email: true },
  });
}

/** ADMIN_NOTIFICATION_EMAIL plus every active admin account email. */
async function getAdminAlertEmails(admins: { email: string }[]): Promise<string[]> {
  const emails = new Set<string>();
  const inbox = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();
  if (inbox) emails.add(inbox);
  for (const admin of admins) {
    if (admin.email) emails.add(admin.email);
  }
  return [...emails];
}

async function sendAdminEmails(
  emails: string[],
  sendOne: (email: string) => Promise<void>,
  label: string,
) {
  if (!isEmailConfigured()) {
    console.warn(`[notifications] Email not configured — ${label} email skipped`);
    return;
  }
  if (emails.length === 0) {
    console.warn(`[notifications] No admin email addresses for ${label}`);
    return;
  }

  let sentCount = 0;
  for (const email of emails) {
    try {
      await sendOne(email);
      sentCount += 1;
    } catch (error) {
      console.error(
        `[notifications] ${label} email failed for ${email}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  if (sentCount === 0) {
    console.error(`[notifications] ${label}: no emails delivered.`);
  }
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

export async function notifyAdminsOfNewStudent(params: {
  studentId: string;
  studentName: string;
  studentUserCode: string | null;
  studentEmail: string;
}) {
  const admins = await getAdminUsersForAlerts();
  const label =
    params.studentUserCode ?
      `${params.studentName} (${params.studentUserCode})`
    : params.studentName;

  for (const admin of admins) {
    await createNotification({
      userId: admin.id,
      type: "SYSTEM",
      title: "New student registered",
      body: `${label} joined Bravio`,
      link: "/dashboard/admin/users",
      metadata: { studentId: params.studentId },
    });
  }

  const emails = await getAdminAlertEmails(admins);
  await sendAdminEmails(
    emails,
    (email) =>
      sendNewStudentAdminEmail({
        to: [email],
        studentName: params.studentName,
        studentUserCode: params.studentUserCode,
        studentEmail: params.studentEmail,
        reviewUrl: `${getAppUrl()}/dashboard/admin/users`,
      }),
    "new student",
  );
}

export async function notifyAdminsOfInstructorApplication(params: {
  instructorId: string;
  instructorName: string;
  instructorUserCode: string | null;
  instructorEmail: string;
  expertise?: string | null;
}) {
  const admins = await getAdminUsersForAlerts();
  const label =
    params.instructorUserCode ?
      `${params.instructorName} (${params.instructorUserCode})`
    : params.instructorName;

  for (const admin of admins) {
    await createNotification({
      userId: admin.id,
      type: "INSTRUCTOR_PENDING",
      title: "New instructor application",
      body: `${label} applied to teach`,
      link: "/dashboard/admin/instructors",
      metadata: { instructorId: params.instructorId },
    });
  }

  const emails = await getAdminAlertEmails(admins);
  await sendAdminEmails(
    emails,
    (email) =>
      sendInstructorPendingAdminEmail({
        to: [email],
        instructorName: params.instructorName,
        instructorUserCode: params.instructorUserCode,
        instructorEmail: params.instructorEmail,
        expertise: params.expertise,
        reviewUrl: `${getAppUrl()}/dashboard/admin/instructors`,
      }),
    "instructor application",
  );
}

export async function notifyInstructorOfApproval(params: {
  instructorId: string;
}) {
  const instructor = await prisma.user.findUnique({
    where: { id: params.instructorId },
    select: { email: true, name: true },
  });
  if (!instructor?.email) return;

  const dashboardUrl = `${getAppUrl()}/dashboard/instructor`;
  const createCourseUrl = `${getAppUrl()}/dashboard/instructor/courses/new`;

  await createNotification({
    userId: params.instructorId,
    type: "SYSTEM",
    title: "Instructor application approved",
    body: "Welcome! You can now access the instructor dashboard and create courses.",
    link: "/dashboard/instructor",
  });

  if (!isEmailConfigured()) {
    console.warn("[notifications] Email not configured — instructor welcome email skipped");
    return;
  }

  try {
    await sendInstructorApprovedWelcomeEmail({
      to: instructor.email,
      instructorName: instructor.name ?? "Instructor",
      dashboardUrl,
      createCourseUrl,
    });
  } catch (error) {
    console.error(
      "[notifications] Instructor welcome email failed:",
      error instanceof Error ? error.message : error,
    );
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
  const admins = await getAdminUsersForAlerts();
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

  const emails = await getAdminAlertEmails(admins);
  const reviewUrl = `${getAppUrl()}/dashboard/admin/withdrawals`;
  const payload = {
    instructorName: params.instructorName,
    instructorUserCode: params.instructorUserCode,
    instructorEmail: params.instructorEmail,
    amountLabel,
    note: params.note,
    reviewUrl,
  };

  await sendAdminEmails(
    emails,
    (email) => sendWithdrawalRequestAdminEmail({ to: [email], ...payload }),
    "withdrawal",
  );
}

export async function notifyStudentOfSuccessfulPurchase(params: {
  userId: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  amount: number;
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { email: true, name: true },
  });
  if (!user?.email) return;

  const amountLabel = formatCurrency(params.amount, getPaystackCurrency());
  const learnUrl = `${getAppUrl()}/learn/${params.courseSlug}`;

  const priorSuccessCount = await prisma.payment.count({
    where: {
      userId: params.userId,
      status: "SUCCESS",
      reference: { not: { startsWith: "comp_" } },
    },
  });
  // This purchase is already SUCCESS when notification runs.
  const isFirstPurchase = priorSuccessCount <= 1;

  await createNotification({
    userId: params.userId,
    type: "SYSTEM",
    title: isFirstPurchase ? "Welcome — purchase successful" : "Purchase successful",
    body: `You now have access to ${params.courseTitle}`,
    link: `/learn/${params.courseSlug}`,
    metadata: { courseId: params.courseId },
  });

  if (!isEmailConfigured()) {
    console.warn("[notifications] Email not configured — purchase email skipped");
    return;
  }

  const { percent, courses } = await getWelcomeSuggestedCourses(
    params.userId,
    params.courseId,
    getAppUrl(),
  );

  try {
    await sendPurchaseSuccessEmail({
      to: user.email,
      studentName: user.name ?? "Learner",
      courseTitle: params.courseTitle,
      amountLabel,
      learnUrl,
      welcomeDiscountPercent: isFirstPurchase ? percent : 0,
      isFirstPurchase,
      suggestions: courses.map((course) => ({
        title: course.title,
        url: course.url,
        priceLabel: course.priceLabel,
        discountedLabel: course.discountedLabel,
      })),
    });
  } catch (error) {
    console.error(
      "[notifications] Purchase email failed:",
      error instanceof Error ? error.message : error,
    );
  }
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}
