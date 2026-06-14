import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { getAnnouncementsForUser } from "@/lib/announcements";
import { InstructorDashboardWrapper } from "@/components/layout/instructor-dashboard-wrapper";
import { AnnouncementPanel } from "@/components/announcements/announcement-panel";
import { StatCard } from "@/components/ui/stat-card";
import { DashboardHero, DashboardSection } from "@/components/ui/dashboard-section";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { BookOpen, DollarSign, Plus, Users, Wallet } from "lucide-react";

export default async function InstructorDashboardPage() {
  const user = await requireRole("INSTRUCTOR", "ADMIN");

  const [profile, courses, payments, announcements] = await Promise.all([
    prisma.instructorProfile.findUnique({ where: { userId: user.id } }),
    prisma.course.count({ where: { instructorId: user.id } }),
    prisma.payment.aggregate({
      where: { course: { instructorId: user.id }, status: "SUCCESS" },
      _sum: { instructorShare: true },
    }),
    getAnnouncementsForUser(user.id, "INSTRUCTOR"),
  ]);

  const enrollments = await prisma.enrollment.count({
    where: { course: { instructorId: user.id } },
  });

  const unreadAnnouncements = announcements.filter((a) => !a.read).length;
  const firstName = user.name?.split(" ")[0] ?? "Instructor";

  return (
    <InstructorDashboardWrapper title="Overview">
      <DashboardHero
        eyebrow="Teaching studio"
        title={`Welcome back, ${firstName}`}
        description="Create courses, upload lessons with video and PDFs, and track student progress from one place."
      >
        <Link href="/dashboard/instructor/courses/new">
          <Button variant="accent" size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            New course
          </Button>
        </Link>
        <Link href="/dashboard/instructor/courses">
          <Button variant="outline" size="sm" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
            Manage courses
          </Button>
        </Link>
      </DashboardHero>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Courses" value={courses} icon={BookOpen} />
        <StatCard label="Students" value={enrollments} icon={Users} tone="success" />
        <StatCard
          label="Total earnings"
          value={formatCurrency(Number(payments._sum.instructorShare ?? 0))}
          icon={DollarSign}
          tone="accent"
        />
        <StatCard
          label="Available balance"
          value={formatCurrency(Number(profile?.balance ?? 0))}
          icon={Wallet}
        />
      </div>

      <DashboardSection
        title="Announcements"
        description={
          unreadAnnouncements > 0 ?
            `${unreadAnnouncements} unread from the platform`
          : "Updates from Bravio admin"
        }
      >
        <AnnouncementPanel announcements={announcements} />
      </DashboardSection>
    </InstructorDashboardWrapper>
  );
}
