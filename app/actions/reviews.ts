"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { hasCourseAccess } from "@/lib/services/enrollment";
import { reviewSchema, reviewReplySchema } from "@/lib/validations/course";

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
    create: { userId: user.id, courseId, ...parsed.data },
    update: parsed.data,
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

  await prisma.reviewReply.create({
    data: {
      reviewId,
      authorId: user.id,
      body: parsed.data.body,
    },
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
