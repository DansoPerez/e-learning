import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Role } from "@/app/generated/prisma/client";

export type NavItem = { href: string; label: string };

const navByRole: Record<Role, NavItem[]> = {
  STUDENT: [
    { href: "/dashboard/student", label: "Overview" },
    { href: "/dashboard/student/courses", label: "My courses" },
    { href: "/dashboard/student/messages", label: "Messages" },
  ],
  INSTRUCTOR: [
    { href: "/dashboard/instructor", label: "Overview" },
    { href: "/dashboard/instructor/courses", label: "My courses" },
    { href: "/dashboard/instructor/messages", label: "Messages" },
    { href: "/dashboard/instructor/withdrawals", label: "Withdrawals" },
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
  ],
};

function isNavItemActive(pathname: string, href: string, items: NavItem[]): boolean {
  const matches = items.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  if (matches.length === 0) return false;
  const best = matches.reduce((a, b) => (a.href.length >= b.href.length ? a : b));
  return best.href === href;
}

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
    <div className="page-container grid gap-8 py-8 lg:grid-cols-[240px_1fr]">
      <aside className="surface-card h-fit p-4 lg:sticky lg:top-24">
        <p className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
          {role.toLowerCase()} menu
        </p>
        <nav className="space-y-0.5">
          {items.map((item) => {
            const active = isNavItemActive(pathname, item.href, items);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  active ?
                    "bg-[var(--primary)] text-white shadow-md shadow-indigo-500/25"
                  : "text-[var(--foreground-secondary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div>
        <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}
