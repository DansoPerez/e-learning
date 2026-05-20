import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { getAnnouncementsForUser } from "@/lib/announcements";
import { InstructorDashboardWrapper } from "@/components/layout/instructor-dashboard-wrapper";
import { AnnouncementPanel } from "@/components/announcements/announcement-panel";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";

export default async function InstructorDashboardPage() {
  const user = await requireRole("INSTRUCTOR", "ADMIN");

  const [profile, courses, payments, announcements] = await Promise.all([
    prisma.instructorProfile.findUnique({ where: { userId: user.id } }),
    prisma.course.count({ where: { instructorId: user.id } }),
    prisma.payment.aggregate({
      where: { course: { instructorId: user.id }, status: "SUCCESS" },
      _sum: { instructorShare: true },
    }),
    getAnnouncementsForUser(user.id, user.role === "ADMIN" ? "INSTRUCTOR" : "INSTRUCTOR"),
  ]);

  const enrollments = await prisma.enrollment.count({
    where: { course: { instructorId: user.id } },
  });

  const unreadAnnouncements = announcements.filter((a) => !a.read).length;

  return (
    <InstructorDashboardWrapper title="Instructor dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Courses" value={courses} />
        <StatCard label="Students" value={enrollments} />
        <StatCard
          label="Total earnings"
          value={formatCurrency(Number(payments._sum.instructorShare ?? 0))}
        />
        <StatCard
          label="Available balance"
          value={formatCurrency(Number(profile?.balance ?? 0))}
        />
      </div>

      <div className="mt-8 flex gap-4">
        <Link
          href="/dashboard/instructor/courses/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Create course
        </Link>
        <Link
          href="/dashboard/instructor/courses"
          className="rounded-lg border px-4 py-2 text-sm hover:bg-zinc-50"
        >
          Manage courses
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">
          Announcements
          {unreadAnnouncements > 0 ?
            <span className="ml-2 text-sm font-normal text-indigo-600">
              ({unreadAnnouncements} unread)
            </span>
          : null}
        </h2>
        <AnnouncementPanel announcements={announcements} />
      </section>
    </InstructorDashboardWrapper>
  );
}
