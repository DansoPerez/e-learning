import type { Role } from "@/app/generated/prisma/client";
import { AdminMobileNav } from "@/components/layout/admin-mobile-nav";
import {
  DashboardHeader,
  DashboardMobileBar,
  DashboardSidebar,
} from "@/components/layout/dashboard-nav";
import { getDashboardNavSections, type NavSection } from "@/lib/site-nav";

export type { NavLink, NavSection } from "@/lib/site-nav";

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
  navSections,
}: {
  role: Role;
  title: string;
  children: React.ReactNode;
  pathname: string;
  navSections?: NavSection[];
}) {
  const sections = navSections ?? getDashboardNavSections(role);
  const isAdmin = role === "ADMIN";
  const navProps = {
    sections,
    pathname,
    roleLabel: roleLabels[role],
  };

  return (
    <div className="dashboard-shell">
      <DashboardMobileBar {...navProps} />

      <div className={`page-container py-4 sm:py-6 ${isAdmin ? "pb-20 lg:pb-6" : ""}`}>
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] lg:items-start lg:gap-6 xl:grid-cols-[minmax(0,240px)_minmax(0,1fr)] xl:gap-8">
          <DashboardSidebar {...navProps} />
          <div className="min-w-0 flex-1">
            <DashboardHeader title={title} />
            <div className="space-y-6">{children}</div>
          </div>
        </div>
      </div>

      {isAdmin ?
        <AdminMobileNav />
      : null}
    </div>
  );
}
