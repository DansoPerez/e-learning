import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { hasCourseAccess } from "@/lib/services/enrollment";
import { QuizTaker } from "@/components/quiz/quiz-taker";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ slug: string; quizId: string }>;
}) {
  const user = await requireAuth();
  const { slug, quizId } = await params;

  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course) notFound();

  const allowed = await hasCourseAccess(user.id, course.id);
  if (!allowed) redirect(`/courses/${slug}`);

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId, courseId: course.id },
    include: { questions: { orderBy: { orderIndex: "asc" } } },
  });
  if (!quiz) notFound();

  if (!quiz.isEnabled) {
    return (
      <div className="page-container py-16 text-center">
        <h1 className="text-xl font-bold">Assessment unavailable</h1>
        <p className="mt-2 text-[var(--foreground-muted)]">
          This quiz has been disabled by an administrator.
        </p>
        <a href={`/learn/${slug}`} className="mt-4 inline-block text-[var(--primary)] hover:underline">
          Back to course
        </a>
      </div>
    );
  }

  const questions = quiz.questions.map((q) => ({
    id: q.id,
    question: q.question,
    type: q.type,
    options: Array.isArray(q.options) ? (q.options as string[]) : null,
  }));

  const attempts = await prisma.quizAttempt.findMany({
    where: { userId: user.id, quizId: quiz.id },
    orderBy: { startedAt: "desc" },
    take: 10,
    select: { id: true, score: true, passed: true, endedAt: true },
  });

  const previousAttempts = attempts.map((a) => ({
    id: a.id,
    score: a.score,
    passed: a.passed,
    endedAt: a.endedAt ? a.endedAt.toISOString() : null,
  }));

  return (
    <QuizTaker
      quizId={quiz.id}
      slug={slug}
      title={quiz.title}
      durationMin={quiz.durationMin}
      questions={questions}
      passingScore={quiz.passingScore}
      previousAttempts={previousAttempts}
    />
  );
}
