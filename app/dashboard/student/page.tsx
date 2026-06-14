import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { getAnnouncementsForUser } from "@/lib/announcements";
import { getFirstUnpassedQuizId, getResumeLessonId } from "@/lib/resume-lesson";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { AnnouncementPanel } from "@/components/announcements/announcement-panel";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default async function StudentDashboardPage() {
  const user = await requireRole("STUDENT", "ADMIN", "INSTRUCTOR");

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: { course: { select: { id: true, title: true, slug: true } } },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  const continueItems = await Promise.all(
    enrollments
      .filter((e) => e.progressPercent < 100)
      .slice(0, 5)
      .map(async (e) => {
        const lessonId = await getResumeLessonId(user.id, e.course.id);
        const quizId =
          lessonId ? null : (
            await getFirstUnpassedQuizId(user.id, e.course.id)
          );
        return { enrollment: e, lessonId, quizId };
      }),
  );

  const announcements = await getAnnouncementsForUser(
    user.id,
    user.role === "ADMIN" ? "STUDENT" : user.role,
  );

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
        {continueItems.length === 0 ?
          <p className="text-zinc-500">
            No enrollments yet.{" "}
            <Link href="/courses" className="text-indigo-600 hover:underline">
              Browse courses
            </Link>
          </p>
        : <div className="space-y-3">
            {continueItems.map(({ enrollment: e, lessonId, quizId }) => (
              <Card key={e.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <CardTitle className="break-words text-base">{e.course.title}</CardTitle>
                  <CardDescription>{e.progressPercent}% complete</CardDescription>
                </div>
                <Link
                  href={
                    lessonId ?
                      `/learn/${e.course.slug}?lesson=${lessonId}`
                    : quizId ?
                      `/learn/${e.course.slug}/quiz/${quizId}`
                    : `/learn/${e.course.slug}`
                  }
                  className="min-h-[44px] shrink-0 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                >
                  Resume
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
