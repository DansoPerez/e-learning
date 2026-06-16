"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpen, GraduationCap, LayoutDashboard, Users } from "lucide-react";

const tabs = [
  {
    href: "/dashboard/admin",
    label: "Home",
    icon: LayoutDashboard,
    match: (p: string) => p === "/dashboard/admin",
  },
  {
    href: "/dashboard/admin/users",
    label: "Users",
    icon: Users,
    match: (p: string) => p.startsWith("/dashboard/admin/users"),
  },
  {
    href: "/dashboard/admin/instructors",
    label: "Instructors",
    icon: GraduationCap,
    match: (p: string) => p.startsWith("/dashboard/admin/instructors"),
  },
  {
    href: "/dashboard/admin/courses",
    label: "Courses",
    icon: BookOpen,
    match: (p: string) => p.startsWith("/dashboard/admin/courses"),
  },
] as const;

/** Fixed bottom bar for admin on mobile — quick access, no popup. */
export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(28,29,31,0.08)] backdrop-blur-md lg:hidden"
      aria-label="Admin quick navigation"
    >
      <div className="grid grid-cols-4">
        {tabs.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-semibold transition-colors touch-manipulation",
                active ?
                  "text-[var(--primary)]"
                : "text-[var(--foreground-muted)]",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5px]")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
