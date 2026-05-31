import type { Role } from "@/app/generated/prisma/client";
import { DashboardHeader, DashboardNav } from "@/components/layout/dashboard-nav";
import { getDashboardNavSections, type NavSection } from "@/lib/site-nav";

export type { NavLink, NavSection } from "@/lib/site-nav";
/** @deprecated Use NavLink */
export type NavItem = { href: string; label: string };

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

  return (
    <div className="page-container py-6 sm:py-8">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-8">
        <DashboardNav
          sections={sections}
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
