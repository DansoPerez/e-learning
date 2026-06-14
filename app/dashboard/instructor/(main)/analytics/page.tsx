import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getInstructorAnalytics } from "@/lib/analytics";
import { InstructorDashboardWrapper } from "@/components/layout/instructor-dashboard-wrapper";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function InstructorAnalyticsPage() {
  const user = await requireRole("INSTRUCTOR", "ADMIN");
  const data = await getInstructorAnalytics(user.id);

  return (
    <InstructorDashboardWrapper title="Analytics">
      <p className="mb-6 text-sm text-[var(--foreground-muted)]">
        Student progress, enrollments, quiz results, and earnings across your courses.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Your courses" value={data.courses.length} />
        <StatCard
          label="Total enrollments"
          value={data.courses.reduce((s, c) => s + c.enrollments, 0)}
        />
        <StatCard label="Total earnings" value={formatCurrency(data.totalEarnings)} />
      </div>

      <section className="surface-card mt-8 p-4 sm:p-6">
        <h2 className="mb-4 font-bold">Course performance</h2>
        {data.courses.length === 0 ?
          <p className="text-sm text-[var(--foreground-muted)]">No courses yet.</p>
        : <>
            <div className="space-y-3 md:hidden">
              {data.courses.map((c) => (
                <article key={c.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                  <p className="break-words font-medium text-[var(--foreground)]">{c.title}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge>{c.status}</Badge>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-[var(--foreground-muted)]">Enrollments</dt>
                      <dd className="font-semibold">{c.enrollments}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--foreground-muted)]">Avg progress</dt>
                      <dd className="font-semibold">{c.avgProgress}%</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--foreground-muted)]">Quizzes</dt>
                      <dd className="font-semibold">{c.quizzes}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b text-[var(--foreground-muted)]">
                    <th className="p-2">Course</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Enrollments</th>
                    <th className="p-2">Avg progress</th>
                    <th className="p-2">Quizzes</th>
                  </tr>
                </thead>
                <tbody>
                  {data.courses.map((c) => (
                    <tr key={c.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="p-2 font-medium">{c.title}</td>
                      <td className="p-2">
                        <Badge>{c.status}</Badge>
                      </td>
                      <td className="p-2">{c.enrollments}</td>
                      <td className="p-2">{c.avgProgress}%</td>
                      <td className="p-2">{c.quizzes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        }
      </section>

      <section className="surface-card mt-6 p-6">
        <h2 className="mb-4 font-bold">Recent quiz attempts</h2>
        {data.recentQuizAttempts.length === 0 ?
          <p className="text-sm text-[var(--foreground-muted)]">No attempts yet.</p>
        : <ul className="space-y-2">
            {data.recentQuizAttempts.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
              >
                <span className="min-w-0 break-words">
                  {a.user.name ?? a.user.email} · {a.quiz.title} ({a.quiz.course.title})
                </span>
                <span className="shrink-0 font-semibold">
                  {a.score}% {a.passed ? "✓" : "✗"} · {formatDate(a.startedAt)}
                </span>
              </li>
            ))}
          </ul>
        }
      </section>

      <section className="surface-card mt-6 p-6">
        <h2 className="mb-4 font-bold">Recent enrollments</h2>
        {data.recentEnrollments.length === 0 ?
          <p className="text-sm text-[var(--foreground-muted)]">No enrollments yet.</p>
        : <ul className="space-y-2">
            {data.recentEnrollments.map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
              >
                <span className="min-w-0 break-words">
                  {e.user.name ?? e.user.email} → {e.course.title}
                </span>
                <span className="shrink-0">{e.progressPercent}% · {formatDate(e.updatedAt)}</span>
              </li>
            ))}
          </ul>
        }
      </section>
    </InstructorDashboardWrapper>
  );
}
