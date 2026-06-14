import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole, getSessionUser } from "@/lib/auth";
import { OnlineUsersPanel } from "@/components/presence/online-users-panel";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { StatCard } from "@/components/ui/stat-card";
import { DashboardHero, DashboardSection, QuickActionGrid } from "@/components/ui/dashboard-section";
import { formatCurrency } from "@/lib/utils";
import { createAnnouncementAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart3,
  BookOpen,
  GraduationCap,
  Settings,
  Shield,
  Users,
  Wallet,
} from "lucide-react";

export default async function AdminDashboardPage() {
  await requireRole("ADMIN");
  const session = await getSessionUser();

  const [users, courses, revenue, pendingInstructors, pendingCourses, allAccessUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.payment.aggregate({
        where: { status: "SUCCESS" },
        _sum: { platformShare: true },
      }),
      prisma.instructorProfile.count({ where: { status: "PENDING" } }),
      prisma.course.count({ where: { status: "PENDING" } }),
      prisma.user.count({ where: { allCoursesAccess: true } }),
    ]);

  const pendingTotal = pendingInstructors + pendingCourses;

  return (
    <DashboardWrapper role="ADMIN" title="Overview">
      <DashboardHero
        eyebrow={session?.isSuperAdmin ? "Super admin" : "Administrator"}
        title="Platform control"
        description={
          session?.isSuperAdmin ?
            "Manage users, approve sensitive access, and monitor live activity across Bravio."
          : "Approve instructors and courses. Sensitive actions require super admin approval."
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={users} icon={Users} />
        <StatCard label="Published courses" value={courses} icon={BookOpen} tone="success" />
        <StatCard
          label="Platform revenue"
          value={formatCurrency(Number(revenue._sum.platformShare ?? 0))}
          icon={Wallet}
          tone="accent"
        />
        <StatCard
          label="Pending reviews"
          value={pendingTotal}
          hint={`${pendingInstructors} instructors · ${pendingCourses} courses`}
          icon={Shield}
        />
      </div>

      <DashboardSection title="Quick actions" description="Jump to common admin tasks">
        <QuickActionGrid
          items={[
            { href: "/dashboard/admin/users", label: "Users", icon: <Users className="h-5 w-5" />, description: "Accounts & access" },
            { href: "/dashboard/admin/instructors", label: "Instructors", icon: <GraduationCap className="h-5 w-5" />, description: "Applications" },
            { href: "/dashboard/admin/courses", label: "Courses", icon: <BookOpen className="h-5 w-5" />, description: "Review & publish" },
            { href: "/dashboard/admin/analytics", label: "Analytics", icon: <BarChart3 className="h-5 w-5" />, description: "Platform metrics" },
            { href: "/dashboard/admin/withdrawals", label: "Withdrawals", icon: <Wallet className="h-5 w-5" />, description: "Payout requests" },
            { href: "/dashboard/admin/settings", label: "Settings", icon: <Settings className="h-5 w-5" />, description: "Commission & config" },
            { href: "/dashboard/admin/logs", label: "Audit logs", icon: <Shield className="h-5 w-5" />, description: "Activity history" },
            { href: "/dashboard/admin/quizzes", label: "Quizzes", icon: <BookOpen className="h-5 w-5" />, description: "Global quiz control" },
          ]}
        />
      </DashboardSection>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {session?.isSuperAdmin ?
          <OnlineUsersPanel />
        : null}

        <div className="space-y-6">
          <section className="surface-card p-5 sm:p-6">
            <h2 className="font-bold text-[var(--foreground)]">New announcement</h2>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Broadcast to students or instructors
            </p>
            <form action={createAnnouncementAction} className="mt-4 space-y-3">
              <select id="scope" name="scope" required className="input-field w-full">
                <option value="STUDENTS">All students</option>
                <option value="INSTRUCTORS">All instructors</option>
              </select>
              <Textarea name="message" placeholder="Your message..." required rows={3} />
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="submit" className="w-full sm:w-auto">
                  Publish
                </Button>
                <Link href="/dashboard/admin/announcements" className="w-full sm:w-auto">
                  <Button type="button" variant="outline" className="w-full">
                    View all
                  </Button>
                </Link>
              </div>
            </form>
          </section>

          <section className="surface-card p-5 sm:p-6">
            <h2 className="font-bold text-[var(--foreground)]">All-courses access</h2>
            <p className="mt-3 text-3xl font-extrabold text-[var(--primary)]">{allAccessUsers}</p>
            <p className="text-sm text-[var(--foreground-muted)]">users with full catalog access</p>
            <Link href="/dashboard/admin/users" className="mt-4 inline-block">
              <Button variant="outline" size="sm">
                Manage users →
              </Button>
            </Link>
          </section>
        </div>
      </div>
    </DashboardWrapper>
  );
}
