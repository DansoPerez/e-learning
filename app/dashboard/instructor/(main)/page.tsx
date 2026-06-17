import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { getAnnouncementsForUser } from "@/lib/announcements";
import { InstructorDashboardWrapper } from "@/components/layout/instructor-dashboard-wrapper";
import { InstructorCourseCard } from "@/components/instructor/instructor-course-card";
import { AnnouncementPanel } from "@/components/announcements/announcement-panel";
import { StatCard } from "@/components/ui/stat-card";
import { DashboardSection } from "@/components/ui/dashboard-section";
import { Button } from "@/components/ui/button";
import { instructorCourseGridClass } from "@/lib/course-grid";
import { formatCurrency } from "@/lib/utils";
import {
  countDistinctInstructorLearners,
  getLearnerCountsByCourseIds,
} from "@/lib/learner-counts";
import { BookOpen, DollarSign, Plus, Users, Wallet } from "lucide-react";

export default async function InstructorDashboardPage() {
  const user = await requireRole("INSTRUCTOR", "ADMIN");

  const [profile, courseCount, recentCourses, payments, announcements, learnerCount] =
    await Promise.all([
      prisma.instructorProfile.findUnique({ where: { userId: user.id } }),
      prisma.course.count({ where: { instructorId: user.id } }),
      prisma.course.findMany({
        where: { instructorId: user.id },
        orderBy: { updatedAt: "desc" },
        take: 4,
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          price: true,
          thumbnailUrl: true,
        },
      }),
      prisma.payment.aggregate({
        where: { course: { instructorId: user.id }, status: "SUCCESS" },
        _sum: { instructorShare: true },
      }),
      getAnnouncementsForUser(user.id, "INSTRUCTOR"),
      countDistinctInstructorLearners(user.id),
    ]);

  const learnerCountsByCourse = await getLearnerCountsByCourseIds(
    recentCourses.map((c) => c.id),
  );

  const unreadAnnouncements = announcements.filter((a) => !a.read).length;

  return (
    <InstructorDashboardWrapper title="Teaching">
      <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[var(--foreground-muted)]">
            Create courses, manage content, and track learner progress.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/instructor/courses/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Create course
            </Button>
          </Link>
          <Link href="/dashboard/instructor/courses">
            <Button variant="outline" size="sm">
              All courses
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Courses" value={courseCount} icon={BookOpen} />
        <StatCard label="Learners" value={learnerCount} icon={Users} tone="success" />
        <StatCard
          label="Earnings"
          value={formatCurrency(Number(payments._sum.instructorShare ?? 0))}
          icon={DollarSign}
          tone="accent"
        />
        <StatCard
          label="Balance"
          value={formatCurrency(Number(profile?.balance ?? 0))}
          icon={Wallet}
        />
      </div>

      <DashboardSection
        title="Your courses"
        action={
          <Link href="/dashboard/instructor/courses">
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </Link>
        }
      >
        {recentCourses.length === 0 ?
          <div className="surface-card flex flex-col items-center justify-center px-6 py-12 text-center">
            <BookOpen className="h-10 w-10 text-[var(--primary-muted)]" />
            <p className="mt-3 text-sm text-[var(--foreground-muted)]">
              You have not created a course yet.
            </p>
            <Link href="/dashboard/instructor/courses/new" className="mt-4">
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" />
                Create your first course
              </Button>
            </Link>
          </div>
        : <div className={instructorCourseGridClass}>
            {recentCourses.map((c) => (
              <InstructorCourseCard
                key={c.id}
                id={c.id}
                title={c.title}
                slug={c.slug}
                status={c.status}
                price={Number(c.price)}
                thumbnailUrl={c.thumbnailUrl}
                enrollmentCount={learnerCountsByCourse.get(c.id) ?? 0}
              />
            ))}
          </div>
        }
      </DashboardSection>

      {announcements.length > 0 ?
        <DashboardSection
          title="Platform updates"
          description={
            unreadAnnouncements > 0 ?
              `${unreadAnnouncements} unread`
            : "Messages from Bravio admin"
          }
        >
          <AnnouncementPanel announcements={announcements} />
        </DashboardSection>
      : null}
    </InstructorDashboardWrapper>
  );
}
