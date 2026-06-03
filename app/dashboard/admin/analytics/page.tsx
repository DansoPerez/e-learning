import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getAdminAnalytics } from "@/lib/analytics";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";

export default async function AdminAnalyticsPage() {
  await requireRole("ADMIN");
  const data = await getAdminAnalytics();

  return (
    <DashboardWrapper role="ADMIN" title="Platform analytics">
      <p className="mb-6 text-sm text-[var(--foreground-muted)]">
        <Link href="/dashboard/admin" className="font-semibold text-[var(--primary)] hover:underline">
          ← Dashboard
        </Link>
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active users" value={data.activeUsers} hint={`of ${data.totalUsers} total`} />
        <StatCard label="Published courses" value={data.publishedCourses} />
        <StatCard label="Total enrollments" value={data.totalEnrollments} />
        <StatCard
          label="Platform revenue"
          value={formatCurrency(data.revenue.platform)}
          hint={`${formatCurrency(data.revenue.total)} gross`}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Quiz attempts" value={data.quizAttempts} />
        <StatCard label="Quiz pass rate" value={`${data.quizPassRate}%`} />
        <StatCard label="Avg quiz score" value={`${data.quizAvgScore}%`} />
        <StatCard
          label="Pending reviews"
          value={data.pendingInstructors + data.pendingCourses}
          hint={`${data.pendingInstructors} instructors · ${data.pendingCourses} courses`}
        />
      </div>

      <section className="surface-card mt-8 p-6">
        <h2 className="mb-4 font-bold text-[var(--foreground)]">Top courses by enrollments</h2>
        {data.topCourses.length === 0 ?
          <p className="text-sm text-[var(--foreground-muted)]">No published courses yet.</p>
        : <ul className="space-y-2">
            {data.topCourses.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border)] px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold">{c.title}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {c._count.enrollments} enrollments · {c._count.reviews} reviews
                  </p>
                </div>
                <Link
                  href={`/courses/${c.slug}`}
                  className="text-xs font-semibold text-[var(--primary)] hover:underline"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        }
      </section>
    </DashboardWrapper>
  );
}
