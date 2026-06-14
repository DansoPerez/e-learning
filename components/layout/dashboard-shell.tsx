import type { Role } from "@/app/generated/prisma/client";
import { DashboardHeader, DashboardNav } from "@/components/layout/dashboard-nav";
import { getDashboardNavSections, type NavSection } from "@/lib/site-nav";
import { cn } from "@/lib/utils";

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

  return (
    <div className="dashboard-shell">
      <div className="page-container py-4 sm:py-6">
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] lg:items-start lg:gap-6 xl:grid-cols-[minmax(0,240px)_minmax(0,1fr)] xl:gap-8">
          <DashboardNav
            sections={sections}
            pathname={pathname}
            roleLabel={roleLabels[role]}
          />
          <div className={cn("min-w-0 flex-1", isAdmin && "pb-20 lg:pb-0")}>
            <DashboardHeader title={title} />
            <div className="space-y-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
