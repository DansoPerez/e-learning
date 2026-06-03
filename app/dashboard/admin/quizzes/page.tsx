import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import {
  overrideQuizAttemptAction,
  toggleQuizEnabledAction,
} from "@/app/actions/admin";
import { ActionRow } from "@/components/ui/action-row";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

export default async function AdminQuizzesPage() {
  await requireRole("ADMIN");

  const [quizzes, attempts] = await Promise.all([
    prisma.quiz.findMany({
      include: {
        course: { select: { title: true, slug: true } },
        _count: { select: { attempts: true, questions: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 40,
    }),
    prisma.quizAttempt.findMany({
      orderBy: { startedAt: "desc" },
      take: 40,
      include: {
        user: { select: { name: true, email: true } },
        quiz: { select: { title: true, course: { select: { title: true } } } },
      },
    }),
  ]);

  return (
    <DashboardWrapper role="ADMIN" title="Quiz control">
      <p className="mb-6 text-sm text-[var(--foreground-muted)]">
        Disable assessments platform-wide per quiz or override student attempt scores (sensitive
        admin).
      </p>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-bold">Quizzes</h2>
        <div className="space-y-3">
          {quizzes.map((q) => (
            <div key={q.id} className="surface-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{q.title}</p>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {q.course.title} · {q._count.questions} questions · {q._count.attempts}{" "}
                    attempts
                  </p>
                  <Badge variant={q.isEnabled ? "success" : "danger"} className="mt-2">
                    {q.isEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <ActionRow>
                  {q.isEnabled ?
                    <form action={toggleQuizEnabledAction.bind(null, q.id, false)}>
                      <Button type="submit" variant="danger" size="sm">
                        Disable
                      </Button>
                    </form>
                  : <form action={toggleQuizEnabledAction.bind(null, q.id, true)}>
                      <Button type="submit" size="sm">
                        Enable
                      </Button>
                    </form>
                  }
                </ActionRow>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold">Recent attempts — override score</h2>
        <div className="space-y-4">
          {attempts.map((a) => (
            <div key={a.id} className="surface-card p-4">
              <p className="font-medium">
                {a.user.name ?? a.user.email} · {a.quiz.title} ({a.quiz.course.title})
              </p>
              <p className="text-sm text-[var(--foreground-muted)]">
                Current: {a.score}% · {a.passed ? "Passed" : "Failed"} · {formatDate(a.startedAt)}
              </p>
              <form
                action={overrideQuizAttemptAction.bind(null, a.id)}
                className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end"
              >
                <div>
                  <label className="text-xs font-medium text-[var(--foreground-muted)]">
                    New score (0–100)
                  </label>
                  <Input
                    name="score"
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={a.score}
                    className="mt-1 min-h-[44px] w-full sm:w-24"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--foreground-muted)]">
                    Passed?
                  </label>
                  <select
                    name="passed"
                    defaultValue={a.passed ? "true" : "false"}
                    className="input-field mt-1 min-h-[44px] w-full sm:w-32"
                  >
                    <option value="true">Pass</option>
                    <option value="false">Fail</option>
                  </select>
                </div>
                <Button type="submit" variant="outline" size="sm" className="min-h-[44px]">
                  Override
                </Button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </DashboardWrapper>
  );
}
