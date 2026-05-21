import type { Role } from "@/app/generated/prisma/client";
import { DashboardHeader, DashboardNav } from "@/components/layout/dashboard-nav";

export type NavItem = { href: string; label: string };

export const navByRole: Record<Role, NavItem[]> = {
  STUDENT: [
    { href: "/dashboard/student", label: "Overview" },
    { href: "/dashboard/student/courses", label: "My courses" },
    { href: "/dashboard/student/messages", label: "Messages" },
    { href: "/dashboard/student/profile", label: "Profile" },
  ],
  INSTRUCTOR: [
    { href: "/dashboard/instructor", label: "Overview" },
    { href: "/dashboard/instructor/courses", label: "My courses" },
    { href: "/dashboard/instructor/messages", label: "Messages" },
    { href: "/dashboard/instructor/withdrawals", label: "Withdrawals" },
    { href: "/dashboard/instructor/profile", label: "Profile" },
  ],
  ADMIN: [
    { href: "/dashboard/admin", label: "Overview" },
    { href: "/dashboard/admin/users", label: "Users" },
    { href: "/dashboard/admin/instructors", label: "Instructors" },
    { href: "/dashboard/admin/courses", label: "Courses" },
    { href: "/dashboard/admin/announcements", label: "Announcements" },
    { href: "/dashboard/admin/reviews", label: "Reviews" },
    { href: "/dashboard/admin/messages", label: "Messages" },
    { href: "/dashboard/admin/withdrawals", label: "Withdrawals" },
    { href: "/dashboard/admin/settings", label: "Settings" },
    { href: "/dashboard/admin/logs", label: "Audit logs" },
    { href: "/dashboard/admin/profile", label: "Profile" },
  ],
};

const roleLabels: Record<Role, string> = {
  STUDENT: "Student",
  INSTRUCTOR: "Instructor",
  ADMIN: "Admin",
};

export function DashboardShell({
  role,
  title,
  children,
  pathname,
  navItems,
}: {
  role: Role;
  title: string;
  children: React.ReactNode;
  pathname: string;
  navItems?: NavItem[];
}) {
  const items = navItems ?? navByRole[role];

  return (
    <div className="page-container py-6 sm:py-8">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:gap-8">
        <DashboardNav
          items={items}
          pathname={pathname}
          roleLabel={roleLabels[role]}
        />
        <div className="min-w-0">
          <DashboardHeader title={title} />
          {children}
        </div>
      </div>
    </div>
  );
}
