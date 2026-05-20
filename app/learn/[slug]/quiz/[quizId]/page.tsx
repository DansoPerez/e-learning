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

  const questions = quiz.questions.map((q) => ({
    id: q.id,
    question: q.question,
    type: q.type,
    options: Array.isArray(q.options) ? (q.options as string[]) : null,
  }));

  return (
    <QuizTaker
      quizId={quiz.id}
      slug={slug}
      title={quiz.title}
      durationMin={quiz.durationMin}
      questions={questions}
    />
  );
}
