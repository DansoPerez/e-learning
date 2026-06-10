"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import {
  courseSchema,
  lessonSchema,
  moduleSchema,
} from "@/lib/validations/course";
import { uniqueSlug } from "@/lib/utils";
import { chargesForCourse } from "@/lib/course-pricing";
import { enrollInFreeCourse } from "@/lib/services/enrollment";
import { initiateCoursePayment } from "@/lib/services/payment";
import { saveLessonPdf } from "@/lib/lesson-pdf-storage";
import { redirect } from "next/navigation";
import { requireApprovedInstructor } from "@/lib/instructor";
import { assertCanEditCourse, assertModuleInCourse } from "@/lib/course-owner";
import { recalculateCourseEnrollments } from "@/lib/services/enrollment";

export type ActionState = { error?: string; success?: boolean };

export async function createCourseAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("INSTRUCTOR", "ADMIN");
  if (user.role === "INSTRUCTOR") {
    await requireApprovedInstructor(user.id);
  }

  const parsed = courseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId") || undefined,
    price: formData.get("price"),
    thumbnailUrl: formData.get("thumbnailUrl") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const slug = await uniqueSlug(parsed.data.title, async (s) => {
    const found = await prisma.course.findUnique({ where: { slug: s } });
    return !!found;
  });

  const course = await prisma.course.create({
    data: {
      ...parsed.data,
      slug,
      instructorId: user.id,
      thumbnailUrl: parsed.data.thumbnailUrl || null,
      categoryId: parsed.data.categoryId || null,
    },
  });

  revalidatePath("/courses");
  redirect(`/dashboard/instructor/courses/${course.id}`);
}

export async function updateCourseAction(
  courseId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("INSTRUCTOR", "ADMIN");
  if (user.role === "INSTRUCTOR") {
    await requireApprovedInstructor(user.id);
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return { error: "Course not found" };
  if (course.instructorId !== user.id && user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const parsed = courseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId") || undefined,
    price: formData.get("price"),
    thumbnailUrl: formData.get("thumbnailUrl") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.course.update({
    where: { id: courseId },
    data: {
      ...parsed.data,
      thumbnailUrl: parsed.data.thumbnailUrl || null,
      categoryId: parsed.data.categoryId || null,
    },
  });

  revalidatePath(`/courses/${course.slug}`);
  revalidatePath(`/dashboard/instructor/courses/${courseId}`);
  return { success: true };
}

export async function submitCourseForReviewAction(courseId: string): Promise<void> {
  const user = await requireRole("INSTRUCTOR", "ADMIN");
  if (user.role === "INSTRUCTOR") {
    await requireApprovedInstructor(user.id);
  }
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || (course.instructorId !== user.id && user.role !== "ADMIN")) return;

  const lessonCount = await prisma.lesson.count({
    where: { module: { courseId } },
  });
  if (lessonCount === 0) {
    redirect(`/dashboard/instructor/courses/${courseId}?error=no-content`);
  }

  await prisma.course.update({
    where: { id: courseId },
    data: { status: "PENDING" },
  });

  revalidatePath(`/dashboard/instructor/courses/${courseId}`);
}

export async function addModuleAction(
  courseId: string,
  formData: FormData,
): Promise<void> {
  const user = await requireRole("INSTRUCTOR", "ADMIN");
  if (user.role === "INSTRUCTOR") {
    await requireApprovedInstructor(user.id);
  }
  await assertCanEditCourse(user.id, user.role, courseId);

  const parsed = moduleSchema.safeParse({
    title: formData.get("title"),
    orderIndex: formData.get("orderIndex") ?? 0,
  });
  if (!parsed.success) return;

  await prisma.module.create({
    data: { ...parsed.data, courseId },
  });

  await recalculateCourseEnrollments(courseId);
  revalidatePath(`/dashboard/instructor/courses/${courseId}`);
}

export async function addLessonAction(
  courseId: string,
  moduleId: string,
  formData: FormData,
): Promise<void> {
  const user = await requireRole("INSTRUCTOR", "ADMIN");
  if (user.role === "INSTRUCTOR") {
    await requireApprovedInstructor(user.id);
  }
  await assertCanEditCourse(user.id, user.role, courseId);
  await assertModuleInCourse(moduleId, courseId);

  const parsed = lessonSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content") || undefined,
    videoUrl: formData.get("videoUrl") || undefined,
    orderIndex: formData.get("orderIndex") ?? 0,
    durationMin: formData.get("durationMin") || undefined,
  });
  if (!parsed.success) return;

  let pdfStorageKey: string | null = null;
  const pdfFile = formData.get("pdf");
  if (pdfFile instanceof File && pdfFile.size > 0) {
    if (pdfFile.type === "application/pdf") {
      try {
        const buffer = Buffer.from(await pdfFile.arrayBuffer());
        pdfStorageKey = await saveLessonPdf(buffer);
      } catch {
        return;
      }
    }
  }

  await prisma.lesson.create({
    data: {
      ...parsed.data,
      moduleId,
      videoUrl: parsed.data.videoUrl || null,
      content: parsed.data.content || null,
      durationMin: parsed.data.durationMin ?? null,
      pdfStorageKey,
    },
  });

  await recalculateCourseEnrollments(courseId);
  revalidatePath(`/dashboard/instructor/courses/${courseId}`);
}

export async function enrollCourseAction(courseId: string): Promise<void> {
  const user = await requireAuth();
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.status !== "PUBLISHED") {
    redirect(`/courses/${course?.slug ?? ""}?error=unavailable`);
  }

  if (chargesForCourse(Number(course.price))) {
    const result = await initiateCoursePayment(user.id, courseId);
    if (result.type === "paid") {
      redirect(result.authorizationUrl);
    }
    if (result.type === "already_owned") {
      revalidatePath(`/courses/${course.slug}`);
      revalidatePath("/dashboard/student");
      redirect(`/learn/${course.slug}`);
    }
  }

  await enrollInFreeCourse(user.id, courseId);
  revalidatePath(`/courses/${course.slug}`);
  revalidatePath("/dashboard/student");
  redirect(`/learn/${course.slug}`);
}
