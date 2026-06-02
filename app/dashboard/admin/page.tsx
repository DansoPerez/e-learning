import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole, getSessionUser } from "@/lib/auth";
import { OnlineUsersPanel } from "@/components/presence/online-users-panel";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";
import { createAnnouncementAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
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

  const quickLinks = [
    { href: "/dashboard/admin/users", label: "Manage users", icon: Users },
    { href: "/dashboard/admin/instructors", label: "Instructors", icon: GraduationCap },
    { href: "/dashboard/admin/courses", label: "Courses", icon: BookOpen },
    { href: "/dashboard/admin/withdrawals", label: "Withdrawals", icon: Wallet },
    { href: "/dashboard/admin/settings", label: "Settings", icon: Settings },
    { href: "/dashboard/admin/logs", label: "Audit logs", icon: Shield },
  ];

  return (
    <DashboardWrapper role="ADMIN" title="Admin command center">
      <div className="mb-8 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-600 to-violet-700 p-6 text-white shadow-lg">
        <p className="text-sm font-medium text-indigo-200">
          {session?.isSuperAdmin ? "Super Admin" : "Admin"}
        </p>
        <h2 className="mt-1 text-2xl font-extrabold">Platform control</h2>
        <p className="mt-2 max-w-2xl text-indigo-100">
          {session?.isSuperAdmin ?
            "Manage all users, approve sensitive admin access, and see who is online."
          : "Approve instructors and courses. Sensitive actions need super admin approval."}
        </p>
      </div>

      {session?.isSuperAdmin ?
        <div className="mb-8">
          <OnlineUsersPanel />
        </div>
      : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={users} />
        <StatCard label="Published courses" value={courses} />
        <StatCard
          label="Platform revenue"
          value={formatCurrency(Number(revenue._sum.platformShare ?? 0))}
        />
        <StatCard
          label="Pending reviews"
          value={pendingInstructors + pendingCourses}
          hint={`${pendingInstructors} instructors · ${pendingCourses} courses`}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="surface-card flex items-center gap-3 p-4 transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
          >
            <div className="rounded-xl bg-[var(--primary-light)] p-2.5 text-[var(--primary)]">
              <Icon className="h-5 w-5" />
            </div>
            <span className="font-semibold text-[var(--foreground)]">{label}</span>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="surface-card p-6">
          <h2 className="font-bold text-[var(--foreground)]">New announcement</h2>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
            Send a message to students or instructors
          </p>
          <form action={createAnnouncementAction} className="mt-4 space-y-3">
            <div className="space-y-2">
              <label htmlFor="scope" className="text-sm font-medium text-[var(--foreground-secondary)]">
                Audience
              </label>
              <select id="scope" name="scope" required className="input-field w-full">
                <option value="STUDENTS">All students</option>
                <option value="INSTRUCTORS">All instructors</option>
              </select>
            </div>
            <Textarea name="message" placeholder="Your message..." required rows={3} />
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
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

        <section className="surface-card p-6">
          <h2 className="font-bold text-[var(--foreground)]">Access overview</h2>
          <p className="mt-4 text-3xl font-extrabold text-[var(--primary)]">{allAccessUsers}</p>
          <p className="text-sm text-[var(--foreground-muted)]">
            users with all-courses access granted by admin
          </p>
          <Link href="/dashboard/admin/users" className="mt-4 inline-block">
            <Button variant="outline" size="sm">
              Manage users →
            </Button>
          </Link>
        </section>
      </div>
    </DashboardWrapper>
  );
}
