"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { hasCourseAccess } from "@/lib/services/enrollment";
import { reviewSchema, reviewReplySchema } from "@/lib/validations/course";
import { logAudit } from "@/lib/audit-log";
import { notifyReviewReply } from "@/lib/notifications";

export type ReviewActionState = { error?: string; success?: boolean };

export async function submitReviewAction(
  courseId: string,
  courseSlug: string,
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const user = await requireAuth();

  const parsed = reviewSchema.safeParse({
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid review" };
  }

  const allowed = await hasCourseAccess(user.id, courseId);
  if (!allowed) {
    return { error: "Enroll in the course to leave a review" };
  }

  await prisma.review.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    create: { userId: user.id, courseId, ...parsed.data, deletedAt: null },
    update: { ...parsed.data, deletedAt: null },
  });

  await logAudit({
    actorId: user.id,
    action: "SUBMIT_REVIEW",
    targetType: "Review",
    targetId: courseId,
    description: `Submitted review on course ${courseSlug}`,
  });

  revalidatePath(`/courses/${courseSlug}`);
  revalidatePath("/dashboard/admin/reviews");
  return { success: true };
}

export async function replyToReviewAction(
  reviewId: string,
  courseSlug: string,
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const user = await requireAuth();

  const parsed = reviewReplySchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid reply" };
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { course: { select: { id: true, instructorId: true, slug: true } } },
  });
  if (!review) return { error: "Review not found" };

  const isInstructorOwner =
    user.role === "INSTRUCTOR" && review.course.instructorId === user.id;
  const isAdmin = user.role === "ADMIN";

  if (!isInstructorOwner && !isAdmin) {
    return { error: "You cannot reply to this review" };
  }

  const body = parsed.data.body.trim();
  await prisma.reviewReply.create({
    data: {
      reviewId,
      authorId: user.id,
      body,
    },
  });

  await notifyReviewReply(reviewId, user.id, review.course.slug, body);
  await logAudit({
    actorId: user.id,
    action: "REPLY_REVIEW",
    targetType: "ReviewReply",
    targetId: reviewId,
    description: `Replied on review for ${review.course.slug}`,
  });

  revalidatePath(`/courses/${courseSlug}`);
  revalidatePath("/dashboard/admin/reviews");
  if (user.role === "INSTRUCTOR") {
    revalidatePath(`/dashboard/instructor/courses/${review.courseId}`);
  }
  return { success: true };
}

export async function adminCommentOnReviewAction(
  reviewId: string,
  formData: FormData,
): Promise<void> {
  const admin = await requireRole("ADMIN");
  const parsed = reviewReplySchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) return;

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { course: { select: { slug: true, id: true } } },
  });
  if (!review) return;

  await prisma.reviewReply.create({
    data: {
      reviewId,
      authorId: admin.id,
      body: parsed.data.body,
    },
  });

  revalidatePath(`/courses/${review.course.slug}`);
  revalidatePath("/dashboard/admin/reviews");
  revalidatePath(`/dashboard/instructor/courses/${review.course.id}`);
}

export async function deleteReviewAction(reviewId: string, courseSlug: string) {
  const user = await requireAuth();
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review || review.userId !== user.id) {
    throw new Error("Cannot delete this review");
  }

  await prisma.review.update({
    where: { id: reviewId },
    data: { deletedAt: new Date() },
  });

  await logAudit({
    actorId: user.id,
    action: "DELETE_REVIEW",
    targetType: "Review",
    targetId: reviewId,
    description: `Soft-deleted review on ${courseSlug}`,
  });

  revalidatePath(`/courses/${courseSlug}`);
  revalidatePath("/dashboard/admin/reviews");
}

export async function deleteReviewReplyAction(replyId: string, courseSlug: string) {
  const user = await requireAuth();
  const reply = await prisma.reviewReply.findUnique({ where: { id: replyId } });
  if (!reply || reply.authorId !== user.id) {
    throw new Error("Cannot delete this reply");
  }

  await prisma.reviewReply.update({
    where: { id: replyId },
    data: { deletedAt: new Date() },
  });

  await logAudit({
    actorId: user.id,
    action: "DELETE_REVIEW_REPLY",
    targetType: "ReviewReply",
    targetId: replyId,
    description: `Soft-deleted reply on ${courseSlug}`,
  });

  revalidatePath(`/courses/${courseSlug}`);
  revalidatePath("/dashboard/admin/reviews");
}
