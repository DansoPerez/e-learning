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

const QUIZ_ERRORS: Record<string, string> = {
  "invalid-quiz": "Check the quiz title and passing score, then try again.",
  "invalid-question": "Check the question text and fields, then try again.",
  "invalid-mcq-options":
    "Multiple-choice questions need at least two options (one per line), and the correct answer must match one of them exactly.",
  "invalid-true-false": 'True/false questions need "true" or "false" as the correct answer.',
  "save-failed":
    "Could not save your changes. Check Vercel logs and confirm DATABASE_URL is set, then try again.",
};

const QUIZ_SUCCESS: Record<string, string> = {
  "quiz-created": "Quiz created.",
  "quiz-updated": "Quiz settings saved.",
  "question-added": "Question added.",
};

function questionOptions(options: unknown): string[] {
  if (!Array.isArray(options)) return [];
  return options.filter((option): option is string => typeof option === "string");
}

export default async function InstructorQuizEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; quizId: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const user = await requireRole("INSTRUCTOR", "ADMIN");
  const { id: courseId, quizId } = await params;
  const { error, success } = await searchParams;

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
      {error ?
        <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {QUIZ_ERRORS[error] ?? decodeURIComponent(error)}
        </p>
      : null}
      {success ?
        <p className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {QUIZ_SUCCESS[success] ?? "Saved."}
        </p>
      : null}
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
                {(() => {
                  const opts = questionOptions(q.options);
                  return opts.length > 0 ?
                      <ul className="mt-2 list-inside list-disc text-sm text-[var(--foreground-secondary)]">
                        {opts.map((opt) => (
                          <li key={opt}>{opt}</li>
                        ))}
                      </ul>
                    : null;
                })()}
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
