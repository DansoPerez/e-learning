"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { signOutAction } from "@/app/actions/auth";
import { PLATFORM_NAME } from "@/lib/constants";
import { DASHBOARD_ROUTES } from "@/lib/constants";
import type { Role } from "@/app/generated/prisma/client";

function dashboardPathForRole(role: Role): string {
  switch (role) {
    case "ADMIN":
      return DASHBOARD_ROUTES.ADMIN;
    case "INSTRUCTOR":
      return DASHBOARD_ROUTES.INSTRUCTOR;
    default:
      return DASHBOARD_ROUTES.STUDENT;
  }
}
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export function HeaderNav() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && !!session?.user;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/95 shadow-[var(--shadow-sm)] backdrop-blur-md">
      <div className="page-container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-bold text-[var(--primary)] transition-opacity hover:opacity-90"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] text-white shadow-md shadow-indigo-500/30">
            <BookOpen className="h-5 w-5" />
          </span>
          {PLATFORM_NAME}
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/courses"
            className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
          >
            Courses
          </Link>
          {status === "loading" ?
            <span className="h-9 w-24 animate-pulse rounded-lg bg-slate-100" aria-hidden />
          : isAuthenticated ?
            <>
              <Link
                href={dashboardPathForRole(session.user.role)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
              >
                Dashboard
              </Link>
              <form action={signOutAction}>
                <Button type="submit" variant="ghost" size="sm">
                  Sign out
                </Button>
              </form>
            </>
          : <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          }
        </nav>
      </div>
    </header>
  );
}
