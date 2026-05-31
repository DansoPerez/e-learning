import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { InstructorDashboardWrapper } from "@/components/layout/instructor-dashboard-wrapper";
import {
  addQuestionAction,
  deleteQuestionAction,
  deleteQuizAction,
  updateQuizAction,
} from "@/app/actions/quiz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

export default async function InstructorQuizEditPage({
  params,
}: {
  params: Promise<{ id: string; quizId: string }>;
}) {
  const user = await requireRole("INSTRUCTOR", "ADMIN");
  const { id: courseId, quizId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, instructorId: true, slug: true },
  });
  if (!course || (course.instructorId !== user.id && user.role !== "ADMIN")) {
    notFound();
  }

  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, courseId },
    include: { questions: { orderBy: { orderIndex: "asc" } } },
  });
  if (!quiz) notFound();

  return (
    <InstructorDashboardWrapper title={quiz.title}>
      <Link
        href={`/dashboard/instructor/courses/${courseId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {course.title}
      </Link>

      <section className="surface-card mb-8 p-6">
        <h2 className="mb-4 font-semibold">Quiz settings</h2>
        <form action={updateQuizAction.bind(null, quiz.id, courseId)} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={quiz.title} required />
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="space-y-2">
              <Label htmlFor="durationMin">Duration (minutes)</Label>
              <Input
                id="durationMin"
                name="durationMin"
                type="number"
                min={0}
                step={1}
                defaultValue={quiz.durationMin ?? ""}
                className="w-32"
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passingScore">Passing score (%)</Label>
              <Input
                id="passingScore"
                name="passingScore"
                type="number"
                min={0}
                max={100}
                defaultValue={quiz.passingScore}
                className="w-32"
              />
            </div>
          </div>
          <Button type="submit">Save quiz</Button>
        </form>
        <form action={deleteQuizAction.bind(null, quiz.id, courseId)} className="mt-4">
          <Button type="submit" variant="danger" size="sm">
            Delete entire quiz
          </Button>
        </form>
      </section>

      <section className="surface-card mb-8 p-6">
        <h2 className="mb-4 font-semibold">Questions ({quiz.questions.length})</h2>
        {quiz.questions.length === 0 ?
          <p className="text-sm text-[var(--foreground-muted)]">No questions yet.</p>
        : <ul className="space-y-4">
            {quiz.questions.map((q, i) => (
              <li
                key={q.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <p className="text-xs font-semibold uppercase text-[var(--foreground-muted)]">
                  Question {i + 1} · {q.type}
                </p>
                <p className="mt-1 font-medium">{q.question}</p>
                {q.options ?
                  <ul className="mt-2 list-inside list-disc text-sm text-[var(--foreground-secondary)]">
                    {(q.options as string[]).map((opt) => (
                      <li key={opt}>{opt}</li>
                    ))}
                  </ul>
                : null}
                <p className="mt-2 text-sm text-emerald-700">
                  Correct: <span className="font-medium">{q.correctAnswer}</span>
                </p>
                <form
                  action={deleteQuestionAction.bind(null, q.id, quiz.id, courseId)}
                  className="mt-3"
                >
                  <Button type="submit" variant="outline" size="sm">
                    Delete question
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        }
      </section>

      <section className="surface-card p-6">
        <h2 className="mb-4 font-semibold">Add question</h2>
        <form
          action={addQuestionAction.bind(null, quiz.id, courseId)}
          className="space-y-3"
        >
          <Textarea name="question" placeholder="Question text" required rows={2} />
          <select name="type" className="input-field w-full max-w-xs" defaultValue="MCQ">
            <option value="MCQ">Multiple choice</option>
            <option value="TRUE_FALSE">True / False</option>
          </select>
          <Textarea
            name="options"
            placeholder="Options (one per line, for MCQ)"
            rows={3}
          />
          <Input name="correctAnswer" placeholder="Correct answer" required />
          <Input
            name="orderIndex"
            type="number"
            min={0}
            step={1}
            defaultValue={quiz.questions.length}
            className="w-24"
          />
          <Button type="submit">Add question</Button>
        </form>
      </section>
    </InstructorDashboardWrapper>
  );
}
