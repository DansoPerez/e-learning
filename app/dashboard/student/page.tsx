import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { getAnnouncementsForUser } from "@/lib/announcements";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { AnnouncementPanel } from "@/components/announcements/announcement-panel";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default async function StudentDashboardPage() {
  const user = await requireRole("STUDENT", "ADMIN", "INSTRUCTOR");

  const [enrollments, announcements] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: user.id },
      include: { course: { select: { title: true, slug: true } } },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    getAnnouncementsForUser(user.id, user.role === "ADMIN" ? "STUDENT" : user.role),
  ]);

  const inProgress = enrollments.filter((e) => e.progressPercent < 100).length;
  const unreadAnnouncements = announcements.filter((a) => !a.read).length;

  return (
    <DashboardWrapper role="STUDENT" title="Student dashboard">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Enrolled courses" value={enrollments.length} />
        <StatCard label="In progress" value={inProgress} />
        <StatCard
          label="Announcements"
          value={announcements.length}
          hint={unreadAnnouncements > 0 ? `${unreadAnnouncements} unread` : undefined}
        />
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Continue learning</h2>
        {enrollments.length === 0 ?
          <p className="text-zinc-500">
            No enrollments yet.{" "}
            <Link href="/courses" className="text-indigo-600 hover:underline">
              Browse courses
            </Link>
          </p>
        : <div className="space-y-3">
            {enrollments.map((e) => (
              <Card key={e.id} className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base">{e.course.title}</CardTitle>
                  <CardDescription>{e.progressPercent}% complete</CardDescription>
                </div>
                <Link
                  href={`/learn/${e.course.slug}`}
                  className="text-sm font-medium text-indigo-600 hover:underline"
                >
                  Continue
                </Link>
              </Card>
            ))}
          </div>
        }
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Announcements</h2>
        <AnnouncementPanel announcements={announcements} />
      </section>
    </DashboardWrapper>
  );
}
