"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { hasCourseAccess } from "@/lib/services/enrollment";
import { questionSchema, quizSchema } from "@/lib/validations/quiz";

export async function createQuizAction(
  courseId: string,
  formData: FormData,
): Promise<void> {
  await requireRole("INSTRUCTOR", "ADMIN");

  const parsed = quizSchema.safeParse({
    title: formData.get("title"),
    durationMin: formData.get("durationMin") || undefined,
    passingScore: formData.get("passingScore") ?? 70,
  });
  if (!parsed.success) return;

  const quiz = await prisma.quiz.create({
    data: { courseId, ...parsed.data, durationMin: parsed.data.durationMin ?? null },
  });

  revalidatePath(`/dashboard/instructor/courses/${courseId}`);
  revalidatePath(`/dashboard/instructor/courses/${courseId}/quizzes/${quiz.id}`);
}

export async function addQuestionAction(
  quizId: string,
  courseId: string,
  formData: FormData,
): Promise<void> {
  await requireRole("INSTRUCTOR", "ADMIN");

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

  revalidatePath(`/dashboard/instructor/courses/${courseId}`);
  revalidatePath(`/dashboard/instructor/courses/${courseId}/quizzes/${quizId}`);
}

export async function updateQuizAction(
  quizId: string,
  courseId: string,
  formData: FormData,
): Promise<void> {
  const user = await requireRole("INSTRUCTOR", "ADMIN");
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true, slug: true },
  });
  if (!course || (course.instructorId !== user.id && user.role !== "ADMIN")) return;

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
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true, slug: true },
  });
  if (!course || (course.instructorId !== user.id && user.role !== "ADMIN")) return;

  const question = await prisma.question.findFirst({
    where: { id: questionId, quizId },
  });
  if (!question) return;

  await prisma.question.delete({ where: { id: questionId } });
  revalidateQuizPaths(courseId, quizId, course.slug);
}

function revalidateQuizPaths(courseId: string, quizId: string, slug: string) {
  revalidatePath(`/dashboard/instructor/courses/${courseId}`);
  revalidatePath(`/dashboard/instructor/courses/${courseId}/quizzes/${quizId}`);
  revalidatePath(`/learn/${slug}`);
}

export async function deleteQuizAction(quizId: string, courseId: string): Promise<void> {
  const user = await requireRole("INSTRUCTOR", "ADMIN");

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true, slug: true },
  });
  if (!course || (course.instructorId !== user.id && user.role !== "ADMIN")) {
    return;
  }

  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, courseId },
  });
  if (!quiz) return;

  await prisma.quiz.delete({ where: { id: quizId } });

  revalidatePath(`/dashboard/instructor/courses/${courseId}`);
  revalidatePath(`/learn/${course.slug}`);
}

export async function submitQuizAttemptAction(
  quizId: string,
  answers: Record<string, string>,
  startedAt: string,
) {
  const user = await requireAuth();

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  });
  if (!quiz) return { error: "Quiz not found" };

  const allowed = await hasCourseAccess(user.id, quiz.courseId);
  if (!allowed) return { error: "Access denied" };

  let correct = 0;
  for (const q of quiz.questions) {
    if (answers[q.id] === q.correctAnswer) correct += 1;
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
      startedAt: new Date(startedAt),
      endedAt: new Date(),
    },
  });

  return { score, passed, total: quiz.questions.length };
}
