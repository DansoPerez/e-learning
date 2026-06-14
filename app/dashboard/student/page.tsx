import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { getAnnouncementsForUser } from "@/lib/announcements";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { AnnouncementPanel } from "@/components/announcements/announcement-panel";
import { StatCard } from "@/components/ui/stat-card";
import { DashboardHero, DashboardSection } from "@/components/ui/dashboard-section";
import { Button } from "@/components/ui/button";
import { BookOpen, Bell, Play, Sparkles } from "lucide-react";

export default async function StudentDashboardPage() {
  const user = await requireRole("STUDENT", "ADMIN", "INSTRUCTOR");

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: { course: { select: { id: true, title: true, slug: true } } },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  const continueEnrollments = enrollments
    .filter((e) => e.progressPercent < 100)
    .slice(0, 5);

  const announcements = await getAnnouncementsForUser(
    user.id,
    user.role === "ADMIN" ? "STUDENT" : user.role,
  );

  const inProgress = enrollments.filter((e) => e.progressPercent < 100).length;
  const unreadAnnouncements = announcements.filter((a) => !a.read).length;
  const firstName = user.name?.split(" ")[0] ?? "Learner";

  return (
    <DashboardWrapper role="STUDENT" title="Overview">
      <DashboardHero
        eyebrow="Your learning hub"
        title={`Hi ${firstName}, keep going`}
        description={
          inProgress > 0 ?
            `You have ${inProgress} course${inProgress === 1 ? "" : "s"} in progress. Pick up where you left off.`
          : "Browse the catalog and enroll in your first course to start learning."
        }
      >
        <Link href="/courses">
          <Button variant="accent" size="sm" className="gap-1.5">
            <Sparkles className="h-4 w-4" />
            Explore courses
          </Button>
        </Link>
      </DashboardHero>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Enrolled" value={enrollments.length} icon={BookOpen} />
        <StatCard label="In progress" value={inProgress} icon={Play} tone="success" />
        <StatCard
          label="Announcements"
          value={announcements.length}
          hint={unreadAnnouncements > 0 ? `${unreadAnnouncements} unread` : undefined}
          icon={Bell}
          tone="accent"
        />
      </div>

      <DashboardSection title="Continue learning">
        {continueEnrollments.length === 0 ?
          <div className="surface-card flex flex-col items-center justify-center px-6 py-12 text-center">
            <BookOpen className="h-10 w-10 text-[var(--primary-muted)]" />
            <p className="mt-3 text-[var(--foreground-muted)]">No active courses yet.</p>
            <Link href="/courses" className="mt-4">
              <Button>Browse catalog</Button>
            </Link>
          </div>
        : <div className="space-y-3">
            {continueEnrollments.map((e) => (
              <article
                key={e.id}
                className="surface-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="break-words font-semibold text-[var(--foreground)]">
                    {e.course.title}
                  </h3>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--background-subtle)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-violet-500 transition-all"
                      style={{ width: `${Math.max(e.progressPercent, 4)}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs font-medium text-[var(--foreground-muted)]">
                    {e.progressPercent}% complete
                  </p>
                </div>
                <Link
                  href={
                    e.lastLessonId ?
                      `/learn/${e.course.slug}?lesson=${e.lastLessonId}`
                    : `/learn/${e.course.slug}`
                  }
                  className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-primary)] hover:bg-[var(--primary-hover)]"
                >
                  <Play className="h-4 w-4" />
                  Resume
                </Link>
              </article>
            ))}
          </div>
        }
      </DashboardSection>

      <DashboardSection
        title="Announcements"
        description={unreadAnnouncements > 0 ? `${unreadAnnouncements} unread` : undefined}
      >
        <AnnouncementPanel announcements={announcements} />
      </DashboardSection>
    </DashboardWrapper>
  );
}
