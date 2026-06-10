"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { hasCourseAccess, recalculateCourseEnrollments, updateCourseProgress } from "@/lib/services/enrollment";
import { questionSchema, quizSchema } from "@/lib/validations/quiz";
import { logAudit } from "@/lib/audit-log";
import { requireApprovedInstructor } from "@/lib/instructor";
import { assertCanEditCourse, assertQuizInCourse } from "@/lib/course-owner";
import {
  createQuizSessionToken,
  verifyQuizSessionToken,
} from "@/lib/quiz-session";
import type { QuestionType } from "@/app/generated/prisma/client";

function normalizeQuizAnswer(value: string, type: QuestionType): string {
  const trimmed = value.trim();
  if (type === "TRUE_FALSE") return trimmed.toLowerCase();
  return trimmed;
}

export async function startQuizAttemptAction(quizId: string) {
  const user = await requireAuth();

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { courseId: true, isEnabled: true },
  });
  if (!quiz) return { error: "Quiz not found" };

  const allowed = await hasCourseAccess(user.id, quiz.courseId);
  if (!allowed) return { error: "Access denied" };

  if (!quiz.isEnabled) {
    return { error: "This assessment has been disabled by an administrator." };
  }

  return { attemptToken: createQuizSessionToken(user.id, quizId) };
}

export async function createQuizAction(
  courseId: string,
  formData: FormData,
): Promise<void> {
  const user = await requireRole("INSTRUCTOR", "ADMIN");
  if (user.role === "INSTRUCTOR") {
    await requireApprovedInstructor(user.id);
  }
  const course = await assertCanEditCourse(user.id, user.role, courseId);

  const parsed = quizSchema.safeParse({
    title: formData.get("title"),
    durationMin: formData.get("durationMin") || undefined,
    passingScore: formData.get("passingScore") ?? 70,
  });
  if (!parsed.success) return;

  const quiz = await prisma.quiz.create({
    data: { courseId, ...parsed.data, durationMin: parsed.data.durationMin ?? null },
  });

  await recalculateCourseEnrollments(courseId);
  revalidatePath(`/dashboard/instructor/courses/${courseId}`);
  revalidatePath(`/dashboard/instructor/courses/${courseId}/quizzes/${quiz.id}`);
  revalidatePath(`/learn/${course.slug}`);
}

export async function addQuestionAction(
  quizId: string,
  courseId: string,
  formData: FormData,
): Promise<void> {
  const user = await requireRole("INSTRUCTOR", "ADMIN");
  if (user.role === "INSTRUCTOR") {
    await requireApprovedInstructor(user.id);
  }
  const course = await assertCanEditCourse(user.id, user.role, courseId);
  await assertQuizInCourse(quizId, courseId);

  const optionsRaw = formData.get("options") as string;
  const options =
    optionsRaw?.trim() ?
      optionsRaw.split("\n").map((o) => o.trim()).filter(Boolean)
    : undefined;

  const parsed = questionSchema.safeParse({
    question: formData.get("question"),
    type: formData.get("type"),
    options,
    correctAnswer: formData.get("correctAnswer"),
    orderIndex: formData.get("orderIndex") ?? 0,
  });
  if (!parsed.success) return;

  await prisma.question.create({
    data: {
      quizId,
      question: parsed.data.question,
      type: parsed.data.type,
      options: parsed.data.options ?? undefined,
      correctAnswer: parsed.data.correctAnswer,
      orderIndex: parsed.data.orderIndex,
    },
  });

  await recalculateCourseEnrollments(courseId);
  revalidateQuizPaths(courseId, quizId, course.slug);
}

export async function updateQuizAction(
  quizId: string,
  courseId: string,
  formData: FormData,
): Promise<void> {
  const user = await requireRole("INSTRUCTOR", "ADMIN");
  if (user.role === "INSTRUCTOR") {
    await requireApprovedInstructor(user.id);
  }
  const course = await assertCanEditCourse(user.id, user.role, courseId);
  await assertQuizInCourse(quizId, courseId);

  const parsed = quizSchema.safeParse({
    title: formData.get("title"),
    durationMin: formData.get("durationMin") || undefined,
    passingScore: formData.get("passingScore") ?? 70,
  });
  if (!parsed.success) return;

  await prisma.quiz.update({
    where: { id: quizId },
    data: { ...parsed.data, durationMin: parsed.data.durationMin ?? null },
  });

  revalidateQuizPaths(courseId, quizId, course.slug);
}

export async function deleteQuestionAction(
  questionId: string,
  quizId: string,
  courseId: string,
): Promise<void> {
  const user = await requireRole("INSTRUCTOR", "ADMIN");
  if (user.role === "INSTRUCTOR") {
    await requireApprovedInstructor(user.id);
  }
  const course = await assertCanEditCourse(user.id, user.role, courseId);
  await assertQuizInCourse(quizId, courseId);

  const question = await prisma.question.findFirst({
    where: { id: questionId, quizId },
  });
  if (!question) return;

  await prisma.question.delete({ where: { id: questionId } });
  await recalculateCourseEnrollments(courseId);
  revalidateQuizPaths(courseId, quizId, course.slug);
}

function revalidateQuizPaths(courseId: string, quizId: string, slug: string) {
  revalidatePath(`/dashboard/instructor/courses/${courseId}`);
  revalidatePath(`/dashboard/instructor/courses/${courseId}/quizzes/${quizId}`);
  revalidatePath(`/learn/${slug}`);
}

export async function deleteQuizAction(quizId: string, courseId: string): Promise<void> {
  const user = await requireRole("INSTRUCTOR", "ADMIN");
  if (user.role === "INSTRUCTOR") {
    await requireApprovedInstructor(user.id);
  }
  const course = await assertCanEditCourse(user.id, user.role, courseId);
  await assertQuizInCourse(quizId, courseId);

  await prisma.quiz.delete({ where: { id: quizId } });

  await recalculateCourseEnrollments(courseId);
  revalidatePath(`/dashboard/instructor/courses/${courseId}`);
  revalidatePath(`/learn/${course.slug}`);
}

export async function submitQuizAttemptAction(
  quizId: string,
  answers: Record<string, string>,
  attemptToken: string,
) {
  const user = await requireAuth();

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  });
  if (!quiz) return { error: "Quiz not found" };

  const allowed = await hasCourseAccess(user.id, quiz.courseId);
  if (!allowed) return { error: "Access denied" };

  if (!quiz.isEnabled) {
    return { error: "This assessment has been disabled by an administrator." };
  }

  const started = verifyQuizSessionToken(attemptToken, user.id, quizId);
  if (!started) {
    return { error: "Invalid or expired quiz session. Refresh the page and try again." };
  }

  if (quiz.durationMin && quiz.durationMin > 0) {
    const elapsedMs = Date.now() - started.getTime();
    const limitMs = quiz.durationMin * 60_000;
    if (elapsedMs < 0 || elapsedMs > limitMs + 30_000) {
      return { error: "Time limit exceeded. Your attempt was not submitted." };
    }
  }

  let correct = 0;
  for (const q of quiz.questions) {
    const given = answers[q.id];
    if (!given) continue;
    const normalized = normalizeQuizAnswer(given, q.type);
    const expected = normalizeQuizAnswer(q.correctAnswer, q.type);
    if (normalized === expected) correct += 1;
  }

  const score =
    quiz.questions.length > 0 ?
      Math.round((correct / quiz.questions.length) * 100)
    : 0;
  const passed = score >= quiz.passingScore;

  await prisma.quizAttempt.create({
    data: {
      userId: user.id,
      quizId,
      score,
      passed,
      answers,
      startedAt: started,
      endedAt: new Date(),
    },
  });

  await logAudit({
    actorId: user.id,
    action: "QUIZ_ATTEMPT",
    targetType: "Quiz",
    targetId: quizId,
    description: `Quiz attempt: ${score}% (${passed ? "passed" : "failed"})`,
  });

  await updateCourseProgress(user.id, quiz.courseId);

  const course = await prisma.course.findUnique({
    where: { id: quiz.courseId },
    select: { slug: true },
  });
  if (course) {
    revalidatePath(`/learn/${course.slug}`);
    revalidatePath(`/dashboard/student`);
    revalidatePath(`/dashboard/student/courses`);
  }

  return { score, passed, total: quiz.questions.length };
}
